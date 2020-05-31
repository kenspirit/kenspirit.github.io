title: Unsolved puzzle of mnesia behavior in mix test
tags:
  - Elixir
  - Mnesia
categories:
  - Sword
date: 2020-04-28 21:23:35
---


Recently, I am evaluating the usage of Mnesia in Elixir.

After figuring out how to use [One Elixir Code for Both Mnesia Master & Child](http://www.thinkingincrowd.me/2020/04/16/One-Elixir-Code-for-Both-Mnesia-Master-Child/), I moved on to data CRUD operation.  

Before writing actual testing code, in order to make each test independent, I need to first complete the setup and teardown tasks between each test.

## Test Callbacks

In Elixir, these callbacks can be used:  

* `setup_all`: Invoked once per module before any test is run.  
* `setup`: Invoked once before each test.  
* `on_exit`: Registered on demand during setup.  

_Tips_: Multiple `setup` and `setup_all` are allowed.  They are invoked in sequence.  Failures in `setup_all` or `setup` will stop all remaining setup callbacks from executing while `on_exit` will always run.  

The test script looks like this:  

```elixir
defmodule Sample.MnesiaTest do
  use ExUnit.Case
  alias :mnesia, as: Mnesia

  ExUnit.Case.register_attribute(__MODULE__, :mnesia_table, accumulate: true)

  @node_list [node()]

  setup_all do
    on_exit fn ->
      Mnesia.stop()
      Mnesia.delete_schema(@node_list)
    end

    Mnesia.create_schema(@node_list)
    Mnesia.start()
  end

  setup context do
    on_exit fn ->
      Enum.each(context.registered[:mnesia_table], fn table ->
        Mnesia.delete_table(table)
      end)
    end
  end

  @mnesia_table :test
  test "Create table", _context do
    // Dummy test code
  end

  @mnesia_table :test
  test "Insert Data", _context do
    // Dummy test code
  end
end
```

* Attribute `:mnesia_table` is registered and used on each test to annotate the table name within the following test.  
* In `setup_all`, it performs steps to bring up the whole Mnesia and shutdown.  
* In `setup`, it destroys the tables used in each test annotated by the `:mnesia_table` attribute.  

I set the `accumulate: true` so that we can specify multiple `@mnesia_table` attributes and so the value of `context.registered[:mnesia_table]` is a list.  

_Tips_: Attribute, similar to tag, is cleared after each test.  The difference is that when a tag is given more than once, the last value wins.


## Puzzle

Everything sounds smooth but I noticed one thing after running `mix test`, the mnesia directory still has files inside.  Shouldn't all files removed after calling `delete_schema`?  But the result of `delete_schema` returns `:ok` when I suspected its failure and printed it.  

Later, I realized that the mnesia directory contains the table name used in the application startup logic prepared last week.  It's the table and schema created during the application startup when running `mix test`.  

<img alt="Mnesia test in umbrella project" src="https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/mnesia_test_in_umbrella.png"/>

Below is the observation of the puzzle:

1. If `mix test` is run under umbrella root, the mnesia directory is generated under root and the files cannot be removed.  
2. However, if `mix test` is run under the folder of `app\mgr` where the mnesia startup and setup logic exists, the mnesia directory is generated there but the files can be removed.  
3. If I add `@moduletag :no_start` to the test module, add below code to the umbrella root `mix.exs`, and then run `mix ut`, the behavior just like running `mix test` in `app\mgr`.

```elixir
def project do
  [
    ...
    aliases: [ut: "test --no-start --only no_start"],
    preferred_cli_env: [ut: :test]
  ]
end
```

Looks like there is something mysterious of the umbrella project causing the mnesia directory issue.  

It took me hours to try to figure out why but no luck.  

Before I got desperate and gave up, I found that the problem can be solved after I changed the `config.exs` following the suggestion in https://github.com/Nebo15/ecto_mnesia/issues/40:  

from

`config :mnesia, dir: 'mnesia.#{Mix.env}.#{node()}'`

to

`config :mnesia, dir: to_charlist Path.join(File.cwd!, 'mnesia.#{Mix.env}.#{node()}')`

Although the problem can be solved, the reason is still a puzzle remained.  Maybe it is the absolute and relative path handling issue of mnesia in umbrella project?  Your advice or explanation is greatly appreciated.  
