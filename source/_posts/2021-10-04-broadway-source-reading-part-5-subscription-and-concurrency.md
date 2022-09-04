title: Broadway Source Reading (Part 5 - Subscription & Concurrency)
date: 2021-10-04 21:26:21
tags:
  - Elixir
  - Source Reading
categories:
  - Sword
---

At the beginning of this interesting [article](https://dockyard.com/blog/2021/06/24/tuning-broadway-rabbitmq-pipelines-for-latency?utm_medium=email&utm_source=elixir-radar) about Broadway's concurrency, it said:

>**Every producer will try to satisfy the demand of every processor.** If a processor asks for two messages and there are two producers, the processor may get four messages. Since it can only process them one at a time, the others will sit in its process mailbox until it’s ready for them.

Where is the source code supporting this statement?

In my blog about [Processor](https://www.thinkingincrowd.me/2021/06/19/broadway-source-reading-processor/), there are several key points in the Startup Call Sequence Flow and the Pipeline Diagram:

1. ProcessorStage `subscribe` to Producer during startup.  
2. ProcessorStage immediately `ask` events from Producer after subscription and `ask` recursively.  
2. `DemandDispatcher` coordinates between the Producer and Processor.  


## How the subscription is done?

In `Subscriber.init/1`, below statement tells us that **every consumer process will subscribe to all producer processes randomly and ask for events**.

```elixir
# We always subscribe in random order so the load is balanced across consumers.
names |> Enum.shuffle() |> Enum.each(&subscribe(&1, state))
```

## Distribution Logic on Biggest Demand

Based on the documentation, the `DemandDispatcher` is:  

> * `GenStage.DemandDispatcher` - dispatches the given batch of events to the consumer with the biggest demand in a FIFO ordering. This is the default dispatcher.

During startup, the initial `dispatcher_state` of the Dispatcher is set to `{[], 0, nil}`.  Once there is a processor subscribed to the producer, its state `{0, pid, ref}` is added to the last of the `demands` list.  

```elixir
def init(_opts) do
  {:ok, {[], 0, nil}}
end

@doc false
def subscribe(_opts, {pid, ref}, {demands, pending, max}) do
  {:ok, 0, {demands ++ [{0, pid, ref}], pending, max}}
end
```

When the Processor `ask` for events after subscription, the Dispatcher's `ask/3` function is called:

```elixir
def ask(counter, {pid, ref}, {demands, pending, max}) do
  max = max || counter

  # Omitted demand checking for brevity

  {current, demands} = pop_demand(ref, demands)
  demands = add_demand(current + counter, pid, ref, demands)

  already_sent = min(pending, counter)
  {:ok, counter - already_sent, {demands, pending - already_sent, max}}
end


defp add_demand(counter, pid, ref, [{c, _, _} | _] = demands) when counter > c do
  [{counter, pid, ref} | demands]
end

defp add_demand(counter, pid, ref, [demand | demands]) do
  [demand | add_demand(counter, pid, ref, demands)]
end

defp add_demand(counter, pid, ref, []) when is_integer(counter) do
  [{counter, pid, ref}]
end

defp pop_demand(ref, demands) do
  {{current, _pid, ^ref}, rest} = List.keytake(demands, ref, 2)
  {current, rest}
end
```

Right after subscription, the `counter` passed in here is the **max_demand** of the Processor.  `pop_demand/2` finds out the current pending demand for this specific consumer, and then `add_demand/4`, assuming `demands` a sorted list of highest demand on the left, adds the current request count to its pending demand, loops through all other consumers and inserts it to the right position.  


## Unexpected Subscription and Demand Distribution

How many events does one Producer get?  How events are distributed across Processors?

RabbitMQ's [Consumer Prefetch](https://www.rabbitmq.com/consumer-prefetch.html) configuration sets the `global` flag to `false` as default value and that means the `:prefetch_count` option is applied to each Producer process (one RabbitMQ consumer) level.  That means when we set the Producer's `:concurrency` to `10`, `:prefetch_count` to `1`, if the RabbitMQ has `10` messages, every Producer should have `1` message in theory.

According to my blog about [producer](http://www.thinkingincrowd.me/2021/05/07/broadway-source-reading-producer/), we know that RabbitMQ Producer does nothing on `handle_demand/2` and it returns an `[]`.  The events should be delivered in `handle_info/2` whenever the RabbitMQ pushes the message to the Producer.  That article's tracking on `ask` function call actually does not reflect the event distribution reality because `ask` is called recursively.  They should happen to see so because they also added debug log in `handle_info/2`.  

According to the Call Sequence Flow and source code, GenStage's `dispatch_events/3` and DemandDispatcher's `dispatch/2` should be called.  The DemandDispatcher splits the events based on the count asked by the Processor, dispatches to the first Processor in `demands` list and rearranging the `demands` list afterwards.  

As the `handle_info/2` of Broadway RabbitMQ Producer passes one event to one Processor at a time, if every producer gets `1` message, and the random subscription makes the `demands` list random, the outcome should be several random Processors got `1` or `2` message.  

However, after I cloned the [experiment project](https://github.com/nathanl/broadway_rabbitmq_experiment) from that article, added some debug messages into the dependency library `GenStage`, `Broadway`, some unexpected behavior occurs.

```elixir
# Pipeline
def start_link(_opts) do
  Broadway.start_link(
    __MODULE__,
    name: __MODULE__,
    producer: [
      module:
        {BroadwayRabbitMQ.Producer,
         queue: Foo.env!(:queue_name),
         connection: Foo.conn_options(),
         qos: [
           # this should never be less than @processor_concurrency
           # or else the processors won't all get messages
           prefetch_count: 1
         ],
         on_failure: :reject},
      # concurrency: 1, # correct behavior
      concurrency: 10, # try this for poor performance
    ],
    processors: [
      default: [
        concurrency: 10,
        max_demand: 1
      ]
    ]
  )
end


# Broadway.Topology.Subscriber.init/1

shuffled_names = names |> Enum.shuffle()
IO.inspect("Processor #{inspect(self())} subscribe to Producer #{inspect(Process.whereis(Enum.at(shuffled_names, 0)))} first")
Enum.each(shuffled_names, &subscribe(&1, state))


# GenStage.DemandDispatcher.subscribe/2

IO.inspect("Subscribed #{inspect(self())} from #{inspect(pid)}")
{:ok, 0, {demands ++ [{0, pid, ref}], pending, max}}


# GenStage.DemandDispatcher.dispatch_demand/3

pids = Enum.map(demands, fn {_, other_pid, _} ->
  other_pid
end)
IO.inspect("Producer #{inspect(self())} sends message to consumer #{inspect(pid)} out of #{inspect(pids)}")
```

When I started the application, the debug message shows that each Processor indeed try to subscribe to producer randomly.  However, if you examine the output below carefully, you can find that **the actual moment of the subscription in GenStage process (debug logs like "Subscribed xxxx from yyyy"), which is also constructing the `demands` list, happens sequentially on each Producer and Processor**.

```iex
"Processor #PID<0.344.0> subscribe to Producer #PID<0.341.0> first"
"Processor #PID<0.345.0> subscribe to Producer #PID<0.333.0> first"
"Processor #PID<0.346.0> subscribe to Producer #PID<0.336.0> first"
"Processor #PID<0.347.0> subscribe to Producer #PID<0.340.0> first"
"Processor #PID<0.348.0> subscribe to Producer #PID<0.341.0> first"
"Processor #PID<0.349.0> subscribe to Producer #PID<0.337.0> first"
"Processor #PID<0.350.0> subscribe to Producer #PID<0.339.0> first"
"Processor #PID<0.351.0> subscribe to Producer #PID<0.339.0> first"
"Processor #PID<0.352.0> subscribe to Producer #PID<0.334.0> first"
"Processor #PID<0.353.0> subscribe to Producer #PID<0.341.0> first"
"Subscribed #PID<0.335.0> from #PID<0.344.0>"
"Subscribed #PID<0.339.0> from #PID<0.344.0>"
"Subscribed #PID<0.341.0> from #PID<0.344.0>"
"Subscribed #PID<0.335.0> from #PID<0.345.0>"
"Subscribed #PID<0.333.0> from #PID<0.344.0>"
"Subscribed #PID<0.335.0> from #PID<0.346.0>"
"Subscribed #PID<0.333.0> from #PID<0.345.0>"
"Subscribed #PID<0.339.0> from #PID<0.345.0>"
"Subscribed #PID<0.335.0> from #PID<0.347.0>"
"Subscribed #PID<0.341.0> from #PID<0.345.0>"
"Subscribed #PID<0.333.0> from #PID<0.346.0>"
"Subscribed #PID<0.342.0> from #PID<0.344.0>"
"Subscribed #PID<0.335.0> from #PID<0.348.0>"
"Subscribed #PID<0.339.0> from #PID<0.346.0>"
"Subscribed #PID<0.333.0> from #PID<0.347.0>"
"Subscribed #PID<0.341.0> from #PID<0.346.0>"
"Subscribed #PID<0.335.0> from #PID<0.349.0>"
"Subscribed #PID<0.333.0> from #PID<0.348.0>"
"Subscribed #PID<0.335.0> from #PID<0.350.0>"
"Subscribed #PID<0.342.0> from #PID<0.345.0>"
"Subscribed #PID<0.339.0> from #PID<0.347.0>"
"Subscribed #PID<0.333.0> from #PID<0.349.0>"
"Subscribed #PID<0.341.0> from #PID<0.347.0>"
"Subscribed #PID<0.338.0> from #PID<0.344.0>"
"Subscribed #PID<0.335.0> from #PID<0.351.0>"
"Subscribed #PID<0.337.0> from #PID<0.344.0>"
"Subscribed #PID<0.342.0> from #PID<0.346.0>"
"Subscribed #PID<0.336.0> from #PID<0.344.0>"
"Subscribed #PID<0.339.0> from #PID<0.348.0>"
"Subscribed #PID<0.333.0> from #PID<0.350.0>"
"Subscribed #PID<0.335.0> from #PID<0.352.0>"
"Subscribed #PID<0.340.0> from #PID<0.344.0>"
"Subscribed #PID<0.338.0> from #PID<0.345.0>"
"Subscribed #PID<0.341.0> from #PID<0.348.0>"
"Subscribed #PID<0.337.0> from #PID<0.345.0>"
"Subscribed #PID<0.342.0> from #PID<0.347.0>"
"Subscribed #PID<0.336.0> from #PID<0.345.0>"
"Subscribed #PID<0.339.0> from #PID<0.349.0>"
"Subscribed #PID<0.333.0> from #PID<0.351.0>"
"Subscribed #PID<0.341.0> from #PID<0.349.0>"
"Subscribed #PID<0.335.0> from #PID<0.353.0>"
"Subscribed #PID<0.342.0> from #PID<0.348.0>"
"Subscribed #PID<0.340.0> from #PID<0.345.0>"
"Subscribed #PID<0.338.0> from #PID<0.346.0>"
"Subscribed #PID<0.334.0> from #PID<0.344.0>"
"Subscribed #PID<0.337.0> from #PID<0.346.0>"
"Subscribed #PID<0.336.0> from #PID<0.346.0>"
"Subscribed #PID<0.333.0> from #PID<0.352.0>"
"Subscribed #PID<0.339.0> from #PID<0.350.0>"
"Subscribed #PID<0.338.0> from #PID<0.347.0>"
"Subscribed #PID<0.334.0> from #PID<0.345.0>"
"Subscribed #PID<0.340.0> from #PID<0.346.0>"
"Subscribed #PID<0.341.0> from #PID<0.350.0>"
"Subscribed #PID<0.337.0> from #PID<0.347.0>"
"Subscribed #PID<0.342.0> from #PID<0.349.0>"
"Subscribed #PID<0.333.0> from #PID<0.353.0>"
"Subscribed #PID<0.334.0> from #PID<0.346.0>"
"Subscribed #PID<0.338.0> from #PID<0.348.0>"
"Subscribed #PID<0.336.0> from #PID<0.347.0>"
"Subscribed #PID<0.341.0> from #PID<0.351.0>"
"Subscribed #PID<0.340.0> from #PID<0.347.0>"
"Subscribed #PID<0.342.0> from #PID<0.350.0>"
"Subscribed #PID<0.339.0> from #PID<0.351.0>"
"Subscribed #PID<0.337.0> from #PID<0.348.0>"
"Subscribed #PID<0.334.0> from #PID<0.347.0>"
"Subscribed #PID<0.336.0> from #PID<0.348.0>"
"Subscribed #PID<0.339.0> from #PID<0.352.0>"
"Subscribed #PID<0.341.0> from #PID<0.352.0>"
"Subscribed #PID<0.337.0> from #PID<0.349.0>"
"Subscribed #PID<0.342.0> from #PID<0.351.0>"
"Subscribed #PID<0.334.0> from #PID<0.348.0>"
"Subscribed #PID<0.338.0> from #PID<0.349.0>"
"Subscribed #PID<0.336.0> from #PID<0.349.0>"
"Subscribed #PID<0.341.0> from #PID<0.353.0>"
"Subscribed #PID<0.339.0> from #PID<0.353.0>"
"Subscribed #PID<0.342.0> from #PID<0.352.0>"
"Subscribed #PID<0.337.0> from #PID<0.350.0>"
"Subscribed #PID<0.340.0> from #PID<0.348.0>"
"Subscribed #PID<0.334.0> from #PID<0.349.0>"
"Subscribed #PID<0.338.0> from #PID<0.350.0>"
"Subscribed #PID<0.342.0> from #PID<0.353.0>"
"Subscribed #PID<0.336.0> from #PID<0.350.0>"
"Subscribed #PID<0.337.0> from #PID<0.351.0>"
"Subscribed #PID<0.334.0> from #PID<0.350.0>"
"Subscribed #PID<0.340.0> from #PID<0.349.0>"
"Subscribed #PID<0.338.0> from #PID<0.351.0>"
"Subscribed #PID<0.336.0> from #PID<0.351.0>"
"Subscribed #PID<0.340.0> from #PID<0.350.0>"
"Subscribed #PID<0.337.0> from #PID<0.352.0>"
"Subscribed #PID<0.334.0> from #PID<0.351.0>"
"Subscribed #PID<0.338.0> from #PID<0.352.0>"
"Subscribed #PID<0.336.0> from #PID<0.352.0>"
"Subscribed #PID<0.340.0> from #PID<0.351.0>"
"Subscribed #PID<0.337.0> from #PID<0.353.0>"
"Subscribed #PID<0.334.0> from #PID<0.352.0>"
"Subscribed #PID<0.336.0> from #PID<0.353.0>"
"Subscribed #PID<0.338.0> from #PID<0.353.0>"
"Subscribed #PID<0.340.0> from #PID<0.352.0>"
"Subscribed #PID<0.334.0> from #PID<0.353.0>"
"Subscribed #PID<0.340.0> from #PID<0.353.0>"
```

Once I send messages to RabbitMQ, we can see that every producer gets one message as expected.  But the `demands` list for every producer is the same, with the starting sequence of every consumer process.  Because the `demands` list across different Producer processes are the same at the beginning, the first batch of events are always distributed to the #1 Processor.  And this is also the observation documented in the experiment project Readme.

```iex
iex(dev@localhost)1> Foo.send_messages(10)
"Producer #PID<0.342.0> got one message."
"Producer #PID<0.340.0> got one message."
"Producer #PID<0.337.0> got one message."
"Producer #PID<0.333.0> got one message."
"Producer #PID<0.334.0> got one message."
"Producer #PID<0.335.0> got one message."
"Producer #PID<0.336.0> got one message."
"Producer #PID<0.338.0> got one message."
"Producer #PID<0.339.0> got one message."
"Producer #PID<0.341.0> got one message."
"Producer #PID<0.342.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.337.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.340.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.333.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.334.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.335.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.336.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.339.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.338.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"Producer #PID<0.341.0> sends message to consumer #PID<0.344.0> out of [#PID<0.345.0>, #PID<0.346.0>, #PID<0.347.0>, #PID<0.348.0>, #PID<0.349.0>, #PID<0.350.0>, #PID<0.351.0>, #PID<0.352.0>, #PID<0.353.0>]"
"processor #PID<0.344.0> got '2'; has 3 message(s) in its mailbox"
"processor #PID<0.344.0> got '3'; has 8 message(s) in its mailbox"
"processor #PID<0.344.0> got '1'; has 7 message(s) in its mailbox"
"processor #PID<0.344.0> got '6'; has 6 message(s) in its mailbox"
"processor #PID<0.344.0> got '4'; has 5 message(s) in its mailbox"
"processor #PID<0.344.0> got '5'; has 4 message(s) in its mailbox"
"processor #PID<0.344.0> got '7'; has 3 message(s) in its mailbox"
"processor #PID<0.344.0> got '10'; has 2 message(s) in its mailbox"
"processor #PID<0.344.0> got '8'; has 1 message(s) in its mailbox"
"processor #PID<0.344.0> got '9'; has 0 message(s) in its mailbox"
```

How can this happen?  My suspicion is that the messages in the mailbox of each Producer process are filled by the sequence of Processors' startup sequence.  That mean even though every Processor tries to subscribe to the Producer randomly by shuffling the producer names, but each Producer still receives the subscription signal from Processor #1 firstly, and then #2, and then #3, and finally the #10.  

This phenomenon happens obviously when the batch size of the messages is equal to or smaller than the processor count.  But even if the batch size is much larger, say 50, beside the first 10 will be sent to the #1 processor, others will be biased to the processors started earlier.  I think the load could only be balanced after the system running for a while.  Below is the output (sorted) of the first batch of `50` messages.

```iex
"processor #PID<0.344.0> got '1'; has 0 message(s) in its mailbox"
"processor #PID<0.344.0> got '10'; has 3 message(s) in its mailbox"
"processor #PID<0.344.0> got '2'; has 7 message(s) in its mailbox"
"processor #PID<0.344.0> got '3'; has 8 message(s) in its mailbox"
"processor #PID<0.344.0> got '4'; has 6 message(s) in its mailbox"
"processor #PID<0.344.0> got '5'; has 0 message(s) in its mailbox"
"processor #PID<0.344.0> got '6'; has 2 message(s) in its mailbox"
"processor #PID<0.344.0> got '7'; has 5 message(s) in its mailbox"
"processor #PID<0.344.0> got '8'; has 1 message(s) in its mailbox"
"processor #PID<0.344.0> got '9'; has 4 message(s) in its mailbox"
"processor #PID<0.345.0> got '11'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '12'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '14'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '17'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '21'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '26'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '32'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '39'; has 0 message(s) in its mailbox"
"processor #PID<0.345.0> got '47'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '13'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '16'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '18'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '22'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '27'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '33'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '40'; has 0 message(s) in its mailbox"
"processor #PID<0.346.0> got '48'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '15'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '20'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '25'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '28'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '34'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '41'; has 0 message(s) in its mailbox"
"processor #PID<0.347.0> got '49'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '19'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '24'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '31'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '35'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '42'; has 0 message(s) in its mailbox"
"processor #PID<0.348.0> got '50'; has 0 message(s) in its mailbox"
"processor #PID<0.349.0> got '23'; has 0 message(s) in its mailbox"
"processor #PID<0.349.0> got '30'; has 0 message(s) in its mailbox"
"processor #PID<0.349.0> got '38'; has 0 message(s) in its mailbox"
"processor #PID<0.349.0> got '43'; has 0 message(s) in its mailbox"
"processor #PID<0.350.0> got '29'; has 0 message(s) in its mailbox"
"processor #PID<0.350.0> got '36'; has 0 message(s) in its mailbox"
"processor #PID<0.350.0> got '46'; has 0 message(s) in its mailbox"
"processor #PID<0.351.0> got '37'; has 0 message(s) in its mailbox"
"processor #PID<0.351.0> got '44'; has 0 message(s) in its mailbox"
"processor #PID<0.352.0> got '45'; has 0 message(s) in its mailbox"
```

_Update:_ As per the discussion in [issue raised in Broadway](https://github.com/dashbitco/broadway/issues/269), my suspicion is correct.  My PRs to GenStage and Broadway have fixed this issue.  :D
