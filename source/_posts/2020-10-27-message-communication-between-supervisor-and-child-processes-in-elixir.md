title: Message communication between supervisor and child processes in Elixir
date: 2020-10-27 20:40:00
tags:
  - Elixir
  - Supervisor
  - OTP
categories:
  - Sword
---

[last blog]: http://www.thinkingincrowd.me/2020/09/06/multi-level-supervision-in-elixir/

Process is one of the core concept in Elixir/Erlang.  Sending & receiving messages between them is crucial.  So how should the communication be done in the spider project I introduced in [last blog][]?

Let us take a look on different types of scenarios below.

## Messages for itself

The `Spider.Fetcher` only has one job.  It asks one URL from `Spider.Manager`, crawls the page content and sends back the result.

This job should be invoked regularly based on a configured interval after initialization and crawling for one URL.  Hence, the `Spider.Fetcher` should send message to itself at this two points as you can see below.

```elixir
def init(state = {spider_config, index, manager_pid}) do
  next_move(spider_config)

  {:ok, state}
end

def handle_info(:crawl, state = {spider_config, _index, manager_pid}) do
  url = GenServer.call(manager_pid, :next_url)

  if url != nil do
    result = crawl(spider_config, url)
    GenServer.cast(manager_pid, {:result, url, result})
  end

  next_move(spider_config)

  {:noreply, state}
end

defp next_move(spider_config) do
  Process.send_after(self(), :crawl, spider_config.crawl_interval)
end
```

## Normal Messages between Parent and Child

As we can see in the code above, `Spider.Fetcher` sends two different types of message to its `Spider.Manager` process.  

* `:next_url` for asking next url to crawl.  
* `:result` for sending back the crawled result.  

The `manager_pid` is captured in its state because leaking the process naming logic here and use Name Registration to look it up again are unnecessary.

For the same reason, the process ids of the child processes are captured during creation.  Messages can be sent through them if I need to collect child processes' status or start/stop them.

For example, in `SpiderEngine.Manager`, the `all_engines` is a map that uses spider name as key, spider process id as value.  

```elixir
def handle_info(:kickoff, _) do
  all_spiders = SpiderStorage.get_all_spiders()

  engines =
    all_spiders
    |> Enum.into(%{}, fn spider_config ->
        start_spider(spider_config, %{})
      end)

  {:noreply, %{all_engines: engines}}
end
```

## Message for Parent Supervisor Termination

### Why the case

It might be counter-intuitive to ask the child process to terminate the whole supervisor, but it's reasonable if you put it under a real scenario.

During spider initialization, if it encounters unrecoverable issues, say unreachable target website or receiving 401 status code because it's blocked, you might prefer to take down the spider instead of keep trying.

### Which direction

In my case, the `Spider.Manager.Facebook` makes the decision on bringing down the whole supervision tree below `Spider.Facebook`.  But how?  Should it directly sends signal to `Spider.Facebook` and ask it to exit?  Or go through the higher ladder by asking the `SpiderEngine.Manager` to terminate it?

**TLDR**.  Never call `Process.exit` with parent process id in child process.  Use `Supervisor.stop/3` or `DynamicSupervisor.terminate_child/2` instead.

### Process.exit

I roughly remember there is one API called `Process.exit/2`, and so wrote some modules to test.

```elixir
defmodule Test.Root do
  use Supervisor

  def start_link(_) do
    Supervisor.start_link(__MODULE__, :no_args, name: __MODULE__)
  end

  def init(:no_args) do
    # Code of Test.Manager is not attached.
    # Added it here just to ensure Test.Root has more than one child. 
    children = [
      Test.Manager,
      Test.Supervisor
    ]

    # So that when Test.Supervisor terminates, it does not affect Test.Root or others
    opts = [strategy: :one_for_one]
    Supervisor.init(children, opts)
  end
end

defmodule Test.Supervisor do
  # When it's terminated normally, it will not be restarted again
  use DynamicSupervisor, restart: :transient

  def start_link(_) do
    DynamicSupervisor.start_link(__MODULE__, :no_args, name: __MODULE__)
  end

  def init(:no_args) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def start_worker(id) do
    spec = %{
      id: id,
      start: {Test.Worker, :start_link, [id]},
      restart: :transient
    }
    DynamicSupervisor.start_child(Test.Supervisor, spec)
  end
end

defmodule Test.Worker do
  use GenServer

  def down(self_pid, sup_pid) do
    GenServer.call(self_pid, {:down, sup_pid})
  end

  def start_link(id) do
    GenServer.start_link(__MODULE__, :no_args, name: :"#{__MODULE__}_#{id}")
  end

  def init(:no_args) do
    {:ok, %{ }}
  end

  def handle_call({:down, sup_pid}, _from, state) do
    {:reply, Process.exit(sup_pid, :normal), state}
  end
end
```

Here is the testing code and result.

```elixir
iex(1)> [root, mgr, sup] = [Test.Root, Test.Manager, Test.Supervisor] |> Enum.map(&Process.whereis/1)
[#PID<0.394.0>, #PID<0.395.0>, #PID<0.396.0>]
iex(2)> {:ok, child_a} = Test.Supervisor.start_worker("A")
{:ok, #PID<0.407.0>}
iex(3)> {:ok, child_b} = Test.Supervisor.start_worker("B")
{:ok, #PID<0.405.0>}
iex(4)> Test.Worker.down(child_a, sup)
true
iex(5)> [root, mgr, sup, child_a, child_b] |> Enum.map(&Process.alive?/1)
[true, true, true, true, true]
iex(6)> Supervisor.which_children(root)
[
  {Test.Supervisor, #PID<0.396.0>, :supervisor, [Test.Supervisor]},
  {Test.Manager, #PID<0.395.0>, :worker, [Test.Manager]}
]
iex(7)> Supervisor.which_children(sup)
[{:undefined, #PID<0.405.0>, :worker, [Test.Worker]}]
```

In step 5, it shows that all the processes created are alived.  But shouldn't the `Test.Supervisor` and two of its child processes be terminated?  When checking on the children of `root` and `sup` processes in step 6 & 7:

1. Process for `sup` and `child_a` are still alive.
2. Process `child_a` is not under supervision of `Test.Supervisor`.

After going through the documentation for API `Process.exit/2` more carefully and learning what **trapping exits** means, I finally the reasons behind.

1. Supervisor traps exits.  Exit signal is transformed to `{:EXIT, from, :normal}` message.
2. `Process.exit(supp, :normal)` from `child_a` makes `Test.Supervisor` think that `child_a` is terminated.
3. `Test.Supervisor` removes `child_a` from its supervision tree even though the `child_a` process is actually alive.

According to the API doc, using `:kill` as exit reason can unconditionally kill the process.  Does it work in this case?

If I changed the handling for `:down` message in `Test.Worker` as below:

```elixir
def handle_call({:down, sup_pid}, _from, state) do
  {:reply, Process.exit(sup_pid, :kill), state}
end
```

The test result will be:

```elixir
iex(1)> [root, mgr, sup] = [Test.Root, Test.Manager, Test.Supervisor] |> Enum.map(&Process.whereis/1)
[#PID<0.400.0>, #PID<0.401.0>, #PID<0.402.0>]
iex(2)> {:ok, child_a} = Test.Supervisor.start_worker("A")
{:ok, #PID<0.419.0>}
iex(3)> {:ok, child_b} = Test.Supervisor.start_worker("B")
{:ok, #PID<0.421.0>}
iex(4)> Test.Worker.down(child_a, sup)
true
iex(5)> [root, mgr, sup, child_a, child_b] |> Enum.map(&Process.alive?/1)
[true, true, false, false, false]
iex(7)> Supervisor.which_children(root)
[
  {Test.Supervisor, #PID<0.423.0>, :supervisor, [Test.Supervisor]},
  {Test.Manager, #PID<0.401.0>, :worker, [Test.Manager]}
]
```

In step 5, the supervision tree of `sup` is terminated.  However, when I checked the children of `root`, there is a new process created for `Test.Supervisor` because it is restarted as it does not exit normally.

### Impact of Restart Strategy

Worth noting that, if we keep using `Process.exit(sup_pid, :normal)` in `Test.Worker` but change the child spec of `Test.Worker` in `Test.Supervisor` by omitting the `restart` strategy which is `:permanent` by default, the test result might be misleading.

```elixir
def start_worker(id) do
  spec = %{
    id: id,
    # restart: :transient, # Omitting this
    start: {Test.Worker, :start_link, [id]}
  }
  DynamicSupervisor.start_child(Test.Supervisor, spec)
end
```

Test result:

```elixir
iex(1)> [root, mgr, sup] = [Test.Root, Test.Manager, Test.Supervisor] |> Enum.map(&Process.whereis/1)
[#PID<0.400.0>, #PID<0.401.0>, #PID<0.402.0>]
iex(2)> {:ok, child_a} = Test.Supervisor.start_worker("A")
{:ok, #PID<0.411.0>}
iex(3)> {:ok, child_b} = Test.Supervisor.start_worker("B")
{:ok, #PID<0.413.0>}
iex(4)> Test.Worker.down(child_a, sup)
true
iex(5)>[root, mgr, sup, child_a, child_b] |> Enum.map(&Process.alive?/1)
[true, true, false, false, false]
iex(6)> Supervisor.which_children(root)
[
  {Test.Supervisor, :undefined, :supervisor, [Test.Supervisor]},
  {Test.Manager, #PID<0.401.0>, :worker, [Test.Manager]}
]
```

It looks like the supervisor process `sup` is terminated correctly.  However, if you start up your application with `sasl` logging on: `iex --logger-sasl-reports true -S mix`, you can see similar information after step 4:

```elixir
08:01:10.976 [error] Child :undefined of Supervisor Test.Supervisor terminated
** (exit) normal
Pid: #PID<0.411.0>
Start Call: Test.Worker.start_link("A")

08:01:10.976 [error] Child :undefined of Supervisor Test.Supervisor failed to start
** (exit) already started: #PID<0.411.0>
Start Call: Test.Worker.start_link("A")

08:01:10.976 [error] Child :undefined of Supervisor Test.Supervisor failed to start
** (exit) already started: #PID<0.411.0>
Start Call: Test.Worker.start_link("A")

08:01:10.976 [error] Child :undefined of Supervisor Test.Supervisor failed to start
** (exit) already started: #PID<0.411.0>
Start Call: Test.Worker.start_link("A")

08:01:10.977 [error] Child :undefined of Supervisor Test.Supervisor caused shutdown
** (exit) :reached_max_restart_intensity
Start Call: Test.Worker.start_link("A")
```

The `Test.Supervisor` actually tries to restart the `child_a` which indicates its termination by `Process.exit(sup_pid, :normal)`, but it keeps failing.  In the end, `Test.Supervisor` shutdown itself due to `:reached_max_restart_intensity`.  It seems the final outcome is what you need, but it is not working the same way as you thought.

[ExTrace]: https://github.com/redink/extrace

By using [ExTrace][] with below command before executing the testing code, it shows what really happens behind the scene.

```elixir
iex(1)> Extrace.calls([
...(1)>   {DynamicSupervisor, :handle_info, fn _ -> :return end},
...(1)>   {DynamicSupervisor, :maybe_restart_child, fn _ -> :return end},
...(1)>   {Test.Worker, :start_link, fn _ -> :return end}
...(1)>   ], 100, scope: :local)
3
iex(2)> [root, mgr, sup] = [Test.Root, Test.Manager, Test.Supervisor] |> Enum.map(&Process.whereis/1)
[#PID<0.382.0>, #PID<0.383.0>, #PID<0.384.0>]
iex(3)> {:ok, child_a} = Test.Supervisor.start_worker("A")
{:ok, #PID<0.400.0>}
iex(4)> {:ok, child_b} = Test.Supervisor.start_worker("B")
{:ok, #PID<0.402.0>}
iex(5)> Test.Worker.down(child_a, sup)
true

08:14:42.840371 <0.384.0> DynamicSupervisor.handle_info({:EXIT, #PID<0.400.0>, :normal}, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {{Test.Worker, :start_link, ["A"]}, :permanent, 5000,
     :worker, [Test.Worker]},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [],
  strategy: :one_for_one
})

08:14:42.851545 <0.384.0> DynamicSupervisor.maybe_restart_child(#PID<0.400.0>, :normal, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {{Test.Worker, :start_link, ["A"]}, :permanent, 5000,
     :worker, [Test.Worker]},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [],
  strategy: :one_for_one
})

08:14:42.852137 <0.384.0> DynamicSupervisor.maybe_restart_child(:permanent, :normal, #PID<0.400.0>, {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker, [Test.Worker]}, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {{Test.Worker, :start_link, ["A"]}, :permanent, 5000,
     :worker, [Test.Worker]},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [],
  strategy: :one_for_one
})

08:14:42.853046 <0.384.0> DynamicSupervisor.maybe_restart_child/5 --> {:ok,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.400.0> => {:restarting,
      {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
       [Test.Worker]}},
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714],
   strategy: :one_for_one
 }}

08:14:42.853617 <0.384.0> DynamicSupervisor.maybe_restart_child/3 --> {:ok,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.400.0> => {:restarting,
      {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
       [Test.Worker]}},
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714],
   strategy: :one_for_one
 }}

08:14:42.854183 <0.384.0> DynamicSupervisor.handle_info/2 --> {:noreply,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.400.0> => {:restarting,
      {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
       [Test.Worker]}},
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714],
   strategy: :one_for_one
 }}

08:14:42.854728 <0.384.0> DynamicSupervisor.handle_info({:"$gen_restart", #PID<0.400.0>}, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {:restarting,
     {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
      [Test.Worker]}},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [-576460714],
  strategy: :one_for_one
})

08:14:42.855276 <0.384.0> DynamicSupervisor.handle_info/2 --> {:noreply,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.400.0> => {:restarting,
      {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
       [Test.Worker]}},
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714, -576460714],
   strategy: :one_for_one
 }}

08:14:42.855847 <0.384.0> DynamicSupervisor.handle_info({:"$gen_restart", #PID<0.400.0>}, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {:restarting,
     {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
      [Test.Worker]}},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [-576460714, -576460714],
  strategy: :one_for_one
})

08:14:42.856410 <0.384.0> DynamicSupervisor.handle_info/2 --> {:noreply,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.400.0> => {:restarting,
      {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
       [Test.Worker]}},
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714, -576460714, -576460714],
   strategy: :one_for_one
 }}

08:14:42.857078 <0.384.0> DynamicSupervisor.handle_info({:"$gen_restart", #PID<0.400.0>}, %DynamicSupervisor{
  args: :no_args,
  children: %{
    #PID<0.400.0> => {:restarting,
     {{Test.Worker, :start_link, ["A"]}, :permanent, 5000, :worker,
      [Test.Worker]}},
    #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
     :worker, [Test.Worker]}
  },
  extra_arguments: [],
  max_children: :infinity,
  max_restarts: 3,
  max_seconds: 5,
  mod: Test.Supervisor,
  name: {:local, Test.Supervisor},
  restarts: [-576460714, -576460714, -576460714],
  strategy: :one_for_one
})

08:14:42.857723 <0.384.0> DynamicSupervisor.handle_info/2 --> {:stop, :shutdown,
 %DynamicSupervisor{
   args: :no_args,
   children: %{
     #PID<0.402.0> => {{Test.Worker, :start_link, ["B"]}, :permanent, 5000,
      :worker, [Test.Worker]}
   },
   extra_arguments: [],
   max_children: :infinity,
   max_restarts: 3,
   max_seconds: 5,
   mod: Test.Supervisor,
   name: {:local, Test.Supervisor},
   restarts: [-576460714, -576460714, -576460714, -576460714],
   strategy: :one_for_one
 }}
```


