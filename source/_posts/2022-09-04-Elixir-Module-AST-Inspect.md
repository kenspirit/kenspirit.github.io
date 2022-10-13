title: Elixir Module AST Inspect
date: 2022-09-04 20:59:26
tags:
  - Elixir
categories:
  - Sword
---

One day, I got a requirement of extracting the public function information from the Elixir Module.  I got no clue how to achieve it at the beginning but it turns out to be an interesting experience afterward.

## Through Documentation

Anyone who learns Elixir should be familiar with Hex Docs.  Hence, my first reaction is to see how it works because there should be a way to extract the function signature and documentation.  I found out that I can use `Code.fetch_docs` as below:

```elixir
{:docs_v1, _, _, _, %{"en" => module_doc}, _meta, doc_elements} =
  Code.fetch_docs(module_or_path)
```

_Notes: If a module name is provided, it must be compiled from a file, not directly in Livebook because of [this](https://elixirforum.com/t/what-is-the-module-name-compiled-in-livebook/49968/2?u=thinkingincrowd)._

The format of the `doc_elements` contains most of the information I need: the function signature and documentation.  However, as there are multiple implementations for one of the functions `get_best_block_height/2`, using `Code.fetch_docs` cannot deal with this scenario.  How to overcome it?

```elixir
[
  {{:function, :get_best_block_height, 1}, 35, ["get_best_block_height(endpoint)"],
   %{
     "en" => "Get best **block height** of Ethereum-type network from given endpoint\n"
   }, %{}},
  {{:function, :get_best_block_height, 2}, 14, ["get_best_block_height(network, endpoint)"],
   %{
     "en" =>
       "Get best **block height** from given endpoint of either:\n* Ethereum\n* Arweave\n\nNot implemented for BTC yet\n"
   }, %{}},
  {{:function, :get_module_doc, 0}, 9, ["get_module_doc()"], %{"en" => "Get module doc\n"}, %{}}
]
```

## Through AST

Anyone who has some years' programming experience should know or hear about AST (Abstract Syntax Tree).  Abstract Syntax Trees are data structures widely used in compilers to represent the structure of program code.

Elixir has great Meta-programming capability and AST can do the job.  I did not come to AST in the first place due to the deep down scare in me facing this advanced & complicated technique.

However, it's actually not as complex as I thought, at least for achieving what I want to do.  According to Elixir's [Documentation](https://hexdocs.pm/elixir/syntax-reference.html#the-elixir-ast):

> The building block of Elixir's AST is a call, such as:
> 
> ```elixir
> sum(1, 2, 3)
> ```
> 
> which is represented as a tuple with three elements:
> 
> ```elixir
> {:sum, meta, [1, 2, 3]}
> ```
> 
> the first element is an atom (or another tuple), the second element is a list of two-element tuples with metadata (such as line numbers) and the third is a list of arguments.
> 
> We can retrieve the AST for any Elixir expression by calling quote:
> 
> ```elixir
> quote do
>   sum()
> end
> #=> {:sum, [], []}
> ```

It is not difficult to understand the AST for a call statement and how to generate the AST.  How about the AST for a module?  Actually, using the `quote` approach cannot get a module's AST.  We can load it from the source file using:

```elixir
source_path |> File.read!() |> Code.string_to_quoted()
```

### Module AST structure

![Elixir Module AST structure](https://github.com/kenspirit/blog-cdn-data/raw/master/elixir-module-ast-inspect.png)

By comparing the Elixir source code and generated AST structure, we can see that AST of the whole module fulfills the basic structure above.  The argument list is an alias and a do block:

```elixir
{:defmodule, [line: 1],
 [
   {:__aliases__, [line: 1], [:BestBlockHeightGetter]},
   [
     do: {:__block__, [], []}
   ]
 ]}
```

### Module Block AST structure

The block AST shows clearly that its argument list contains separate ASTs for every attribute (starting with `:@` atom) and function (starting with `:def` atom).

### Function AST structure

As we can see, for simple functions without guard:

* If it has no parameters, the `get_module_doc` function (`[line: 12]`), its argument list in AST is nil.
* If it has parameters, the `get_best_block_height` function (`[line: 26]`, `[line: 31]` and `[line: 39]`), the parameter is either a constant value or an AST.

The function with guard is a bit more complex but you should still be able to recognize the components.

```elixir
# get_module_doc
{:def, [line: 12],
 [
   {:get_module_doc, [line: 12], nil},
   [do: {:@, [line: 12], [{:moduledoc, [line: 12], nil}]}]
 ]}

# get_best_block_height
{:def, [line: 26],
 [
   {:get_best_block_height, [line: 26],
    ["ethereum", {:\\, [line: 26], [{:endpoint, [line: 26], nil}, "eth"]}]},
   [
     do: {:__block__, [], []}
   ]
 ]}

{:def, [line: 26],
 [
   {:get_best_block_height, [line: 31], ["arweave", {:endpoint, [line: 26], nil}]},
   [
     do: {:__block__, [], []}
   ]
 ]}

{:def, [line: 39],
 [
   {:get_best_block_height, [line: 39], [{:endpoint, [line: 39], nil}]},
   [
     do: {:__block__, [], []}
   ]
 ]}

# With Guards
{:def, [line: 22],
 [
   {:when, [line: 22],
    [
      {:get_best_block_height, [line: 22],
       [{:network, [line: 22], nil}, {:_endpoint, [line: 22], nil}]},
      {:==, [line: 22], [{:network, [line: 22], nil}, "btc"]}
    ]},
   [do: {:-, [line: 23], [1]}]
 ]}
```

Hence, based on this generated AST, I can get back the function signature using this code snippet (I know the part handling the `when` case is a bit ugly).

```elixir
{:ok, {:defmodule, _meta, [_, [do: {:__block__, _, block_statements}]]}} =
  source_file_path |> File.read!() |> Code.string_to_quoted()

quote_arg = fn arg ->
  if is_binary(arg), do: "\"#{arg}\"", else: arg
end

parse_arg = fn arg ->
  case arg do
    {:\\, _, [{arg_name, _, _}, actual]} ->
      "#{arg_name} \\\\ #{quote_arg.(actual)}"

    {arg_name, _, _} ->
      arg_name

    _ ->
      quote_arg.(arg)
  end
end

block_statements
|> Enum.filter(fn statement ->
  case statement do
    {:def, _meta, _args} ->
      true

    _ ->
      false
  end
end)
|> Enum.map(fn {:def, _meta, [signature, _block]} ->
  signature
end)
|> Enum.map(fn fun_ast ->
  case fun_ast do
    {:when, _meta, [{fun_name, _, args}, {operator, _, [arg1, arg2]}]} ->
      "#{fun_name}(#{Enum.map(args, &parse_arg.(&1)) |> Enum.join(", ")}) when #{parse_arg.(arg1)} #{operator} #{parse_arg.(arg2)}"

    {fun_name, _meta, nil} ->
      "#{fun_name}()"

    {fun_name, _meta, args} ->
      "#{fun_name}(#{Enum.map(args, &parse_arg.(&1)) |> Enum.join(", ")})"
  end
end)
|> Enum.each(&IO.puts/1)
```

The output would be:

```elixir
get_module_doc()
get_best_block_height(network, _endpoint) when network == "btc"
get_best_block_height("ethereum", endpoint \\ "eth")
get_best_block_height("arweave", endpoint)
get_best_block_height(endpoint)
```
