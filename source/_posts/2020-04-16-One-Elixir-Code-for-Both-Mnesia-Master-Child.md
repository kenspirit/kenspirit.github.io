title: One Elixir Code for Both Mnesia Master & Child
date: 2020-04-16 22:40:43
tags:
  - Elixir
  - Mnesia
  - Distributed
categories:
  - Sword
---

Mnesia is a native, persistent and distributed database in Erlang's world.  If we want to use Erlang/Elixir to build a fault-tolerance distributed application, Mnesia is quite attractive because it's so closed to Erlang and has such great features:  

* Fast real-time key/value lookup  
* Complicated non-real-time queries mainly for operation and maintenance  
* Distributed data because of distributed applications  
* High fault tolerance  
* Dynamic reconfiguration  
* Complex objects  

To start using Mnesia, a couple of steps are required:  

1. Specify a directory for data persistence
2. Create schema (Only for the first time usage)
3. Start Mnesia
4. Create tables when required

It does not seems challenging at first glance.  However, it is if you think ahead on how it's going to be used in dev, test and production environment with distributed nodes.  Let me elaborate why below.


## Specifying Directory

This sounds easy but devil lies in detail.  

### Use Environment Variable

Below command can be used when starting up your elixir application and set the Mnesia directory with the environment variable.  

```sh
iex --erl '-mnesia dir "path/to/db"' -S mix
```

However, it's inconvenient as you have to constantly change the value for different environments, and nodes when testing distributed scenarios.

### Use Mix Config

The idea of using Mix Config may be your instant reaction after that.  We can setup in `config/config.exs` to fix above problems:  

```elixir
config :mnesia, dir: 'mnesia.#{Mix.env}.#{node()}'
```

_Notes:_ `dir` path must use single quote.

The settings here can separate different environments for you easily.  However, as the Mix Config is compile-time setting, the `node()` might cause undesired effect because it's the value `:nonode@nohost` evaluated in compile time.  That should not be the desired value you want to use in production environment.

### Use Config and Release

After Elixir 1.9, there is a new `Config` module as a replacement for `Mix.Config` and Mix Release is introduced.

We can setup a file named `releases.exs` in `config` folder along with `config.exs`:

```elixir
# In releases.exs file

import Config

config :mnesia, dir: System.get_env("MNESIA_DIR") || 'mnesia_#{System.get_env("RELEASE_NODE")}'
```

Then in `rel` folder created by `mix release.init`, we can update `env.sh.eex` or `env.bat.eex` to set above variables.  Normally, we just need to uncomment the last two lines in the file.  But I have two extra lines ahead to use the `HOST` and `NODE_NAME` variables so that I can easily change them for the node.


```elixir
#!/bin/sh

# Sets and enables heart (recommended only in daemon mode)
# case $RELEASE_COMMAND in
#   daemon*)
#     HEART_COMMAND="$RELEASE_ROOT/bin/$RELEASE_NAME $RELEASE_COMMAND"
#     export HEART_COMMAND
#     export ELIXIR_ERL_OPTIONS="-heart"
#     ;;
#   *)
#     ;;
# esac

# Set the release to work across nodes. If using the long name format like
# the one below (my_app@127.0.0.1), you need to also uncomment the
# RELEASE_DISTRIBUTION variable below.

HOST=${HOST:-127.0.0.1}
NODE_NAME=${NODE_NAME:-<%= @release.name %>}

export RELEASE_DISTRIBUTION=name
export RELEASE_NODE=$NODE_NAME@$HOST
```

Once you have completed the setup above, you can update the `mix.exs` as below to build different releases and startup the apps with different node names as needed.

```elixir
  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: [
        foo: [
          version: "0.0.1",
          applications: [mgr: :permanent],
          cookie: "thinkingincrowd"
        ],
        bar: [
          version: "0.0.1",
          applications: [worker: :permanent],
          cookie: "thinkingincrowd"
        ]
      ]
    ]
  end
```


## One Elixir Code

Now goes to the second step.

The API for Mnesia to create table schemas is:  

```erlang
create_schema(DiscNodes) -> ok | {error,Reason}
```

The `DiscNodes` parameters should include all **alive** Erlang nodes.  So people, at least me, may wonder how can I know all the node names ahead?  Isn't a cluster supposed to be dynamic?

Why not do it in a more natural, lean and agile way instead?  We start only one node at the beginning and gradually add more nodes to form a cluster.  This approach is also applicable even if you know your nodes in advance.

### Mnesia Startup Customization

If we include the Mnesia into our Elixir application by putting it into `extra_applications` like `logger`, it will startup Mnesia automatically.  But this is not what we want if we have to do some customization and logic before that.

Instead, we should put it to the `included_applications` like this:

```elixir
  def application do
    [
      extra_applications: [:logger],
      mod: {Sample.Application, []},
      included_applications: [:mnesia]
    ]
  end
```

Then what should we do in the `start` function of `Sample.Application` before starting Mnesia up?

The difference between master node and later-joined child node is that the child knows which master node to refer to.  So, we can use an environment variable to distinguish the behavior during startup.  

```elixir
  use Application

  def start(_type, _args) do
    prepare_mnesia()

    children = [
      # Starts a worker by calling: Sample.Worker.start_link(arg)
      # {Sample.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Sample.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp prepare_mnesia do
    master_node = System.get_env("MASTER_NODE")

    if master_node == nil do
      Sample.Mnesia.init_master()
    else
      String.to_atom(master_node)
      |> Sample.Mnesia.add_self_to_cluster
    end
  end
```

### Master Node Logic

In `Sample.Mnesia.init_master`, the operations should involve all the steps we listed at the very beginning.

```elixir
defmodule Sample.Mnesia do

  alias :mnesia, as: Mnesia

  def init_master() do
    Mnesia.stop()

    node_list = [node()]

    Mnesia.create_schema(node_list)

    Mnesia.start()

    Mnesia.create_table(:sample, [attributes: [:id, :title, :content, :tags], index: [:tags], disc_copies: node_list])

    Mnesia.wait_for_tables([:sample], 5_000)
  end
end
```

_Tips:_ As `Mnesia.start()` is asynchronous, if we want do have operation on the tables, we should wait for them to be ready.  Function `wait_for_tables` is for such purpose.

### Client Node Logic

What need to be done if we try to add a new node into the cluster?  Let's directly see the `add_self_to_cluster` function in `Sample.Mnesia`.  

```elixir
  def add_self_to_cluster(master_node) do
    Node.connect(master_node)

    Mnesia.start()

    :rpc.call(master_node, Sample.Mnesia, :add_child_to_cluster, [node()])

    Mnesia.add_table_copy(:sample, node(), :disc_copies)

    Mnesia.wait_for_tables([:sample], 5_000)
  end

  def add_child_to_cluster(child_node) do
    Mnesia.change_config(:extra_db_nodes, [child_node])

    Mnesia.change_table_copy_type(:schema, child_node, :disc_copies)
  end
```

1. Connect the client Erlang node to master.  
2. Startup Mnesia locally.  
3. Remotely invoke master node's `add_child_to_cluster` function:  
  * `change_config` adds the child node into the Mnesia nodes list.  Child node will has a copy of the schema at this point.  
  * `change_table_copy_type` changes the schema table type in child node from `ram_copies` to `disc_copies`.  
4. Function `add_table_copy` makes another copy of the desired table in child node to `disc_copies`.
5. Wait for the table to be ready.

_Tips:_ If the `add_table_copy` is skipped, but you read the `:sample` table in child node, it actually goes to the master node to get the data.


## Wrap Up

Above code is simple and some what naive, but it's easy to have the basic understanding on what needs to be done.  

After the cluster is formed, when any of the node restarts, you do not need to provide the `MASTER_NODE` environment variable.  As the schemas and tables are created already, calling the function again will return `aborted` without harm.  

During the research, I have googled around and found some powerful library to help form the Elixr/Mnesia clustering more intelligently.  You can take a look at them if you need more fancy features.  

https://github.com/bitwalker/libcluster

https://github.com/beardedeagle/mnesiac


