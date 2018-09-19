title: 那些让你更爱 Elixir 的理由
date: 2018-09-20 08:10:45
tags:
  - Elixir
categories:
  - Sword
---

[初尝 Elixir，真的挺好喝的]: http://www.thinkingincrowd.me/2018/08/21/first-taste-on-elixir/  
[深入到骨子里的分布式和微服务化编程语言]: http://www.thinkingincrowd.me/2018/09/19/programming-language-born-for-distributed-environment/  

如果前面的 [初尝 Elixir，真的挺好喝的][] 和 [深入到骨子里的分布式和微服务化编程语言][] 都还没能让你爱上 Elixir，那我就再补充两个它可以赋予你改造语言能力的特性吧。  


## Meta Programming

Elixir 的元编程能力，拥有和 Lisp 一样的代码即数据的特点。它的方法名，参数和方法体等，能用 List 的数据格式包装起来，传给宏（Macro），再做分析或者扩展。且看 [Programming Elixir ≥ 1.6][] 书中很简单的展示代码。  

```elixir
defmodule My do
  defmacro macro(param) do
    IO.inspect param
  end
end  
  
defmodule Test do
  require My

  My.macro do
    1 + 2
  else
    3 + 4
  end
end  
  
# => [
      do: {:+, [line: 7], [1, 2]},
      else: {:+, [line: 9], [3, 4]}
     ]
```

`IO.inspect` (类似于 `System.out` 或者 `console.log`) 打印出来的就是宏接收到的以 List 格式包装的代码。  

所以，通过宏（Macro），我们可以动态生成代码，实现 AOP 在方法前后包装自己的逻辑等。比如下面的代码，`times_3` 和 `times_4` 就是动态生成的方法。  

```elixir
defmodule Times do
  defmacro times_n(n) do
    quote do
      def unquote(:"times_#{n}")(v) do
        unquote(n) * v
      end
    end
  end
end  
  
defmodule Test do
  require Times

  Times.times_n(3)
  Times.times_n(4)
end  
  
IO.puts Test.times_3(4)   #=> 12
IO.puts Test.times_4(5)   #=> 20
```

## Protocol

“多态”，对于学过面向对象的开发人员来说，应该是一个很熟悉的概念了。单一的接口，不同的类型或实现。  

在 JAVA 里，如果你想实现“多态”，你必须修改那些类的源代码，让它们都继承某个公共类，或者实现某个统一的接口。假如，你想为第三方的一些“多态”类添加一些行为，但你没办法修改它的源代码，这就比较尴尬了。然后各种幺蛾子的方法都会弄出来。  

[Programming Elixir ≥ 1.6]: https://pragprog.com/book/elixir16/programming-elixir-1-6  

但是，Elixir Protocol 的实现方式，可以让你不必修改对方的源代码的情况下，实现扩展。借 [Programming Elixir ≥ 1.6][] 书中的例子来说明一下。  

```elixir
defprotocol Collection do
  @fallback_to_any true
  def is_collection?(value)
end  
  
defimpl Collection, for: [List, Tuple, BitString, Map] do
  def is_collection?(_), do: true
end  
  
defimpl Collection, for: Any do
  def is_collection?(_), do: false
end  
  
Enum.each [1, 1.0, [1, 2], {1, 2}, %{}, "cat"], fn value ->
  IO.puts "#{inspect value}: #{Collection.is_collection?(value)}"
end
  
# 打印出来的结果就是：  
  
1: false
1.0: false
[1, 2]: true
{1, 2}: true
%{}: true
"cat": true
```

上面就为系统内置的数据类型，定义了一个很简单的 “多态” 函数，检测哪些是属于集合类。嗯，就是这么简洁。  

[A week with Elixir]: https://joearms.github.io/published/2013-05-31-a-week-with-elixir.html

Elixir 除了功能强大，学习它还可以给自己一种非常不同的思维方式。如果说 Elixir 有什么不好，那就是周边的人少了点吧，Slack Channel 才 2W 多人，遇到问题找答案可就不是那么容易的事情了。不过，我觉得还是值得的。  

最后附上 Joe Armstrong 老爷子，Erlang 作者对 Elixir 的第一印象文章 [A week with Elixir][]。  
