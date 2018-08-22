title: 初尝 Elixir，真的挺好喝的。
date: 2018-08-21 20:52:46
tags:
  - Elixir
  - Functional Programming
categories:
  - Sword
---

其实，之前从北京回来的时候，我就在考虑学习 Go 还是 Elixir。  

因为现在很多的区块链项目和 docker 等虚拟技术都是用 Go 语言实现，同时公司用 Hyperledger Fabric 时也要写点 chaincode，所以一开始的时候看了一下 Go。不过，我好像怎么都没法被它吸引起来。可能因为自己是一个并非从写 C 语言成长起来的程序员？  

[Programming Elixir ≥ 1.6]: https://pragprog.com/book/elixir16/programming-elixir-1-6  

自从看了「程序人生」公众号里面的两篇关于 Elixir 的文章，终于忍不住买了一本「[Programming Elixir ≥ 1.6][]」来看。一看真的是舍不得放下。除了 Elixir 这门函数式语言本身的特性我很喜欢外，作者的理念和写作风格也是很和我心意。  

## 编程就是数据转换

>Programming Should Be About Transforming Data

看到书里面的这句话，就已经感觉 Elixir 一定挺对我胃口的，或许自己真的是函数式的忠粉吧。我一直觉得啥都封装成一个对象，真的挺累的。而且，如果你深刻地理解了这句话，数据分析的 ETL（Extract - Transform - Load）是那么地自然，Map/Reduce 分而治之也是很好理解。  


## 模式匹配

### 赋值

开篇我就被作者颠覆了骨子里的一个最基本的认知：赋值（Assignment）。  

凡是学过一点点编程的人应该都知道，`=` 是大多数编程语言的赋值操作符。即便不是这样，也会有类似的一个符号，在它的左边是一个变量，右边是赋值给它的常量，其它变量或一些运算，比如：`a = 1` 或者 `a = max(number_list)`。  

但是，在 Elixir 里面，`=` 是匹配操作符。  

```elixir
iex>a = 1
1
iex>1 = a
1
iex>2 = a
** (MatchError) no match of right hand side value: 1
```

第一句代码可能让我们认为它是和其它编程语言一样的赋值语句，但是看到后面两句估计就有点懵逼了。这是什么鬼？变量怎么可以在右边？  

其实，`=` 在 Elixir 里被成为匹配操作符。它的作用是让 Elixir 去尝试寻找满足 `=` 号两边相等的情况。而把 `a` 赋值为 `1` 就满足这样的条件了。在匹配的时候，Elixir 只可以修改 `=` 号左边的变量值，而会把右边的变量用它的值来替换。所以，如果没有最开始的 `a = 1` 那个语句，第二句 `1 = a` 是会出错的。  

要改变习惯，转成这种思维方式并不容易。而且，Elixir 的模式匹配还支持比较复杂的形式，比如：  

```elixir
ken = %{ name: "Ken", likes: "programming", has: "a wife and a son" }
case ken do
  %{ likes: something } = person = man ->
    IO.puts "#{person.name} likes #{something} and has #{man.has}"
end
```

一开始看到书上有一个类似的例子（` = man` 那部分是为了在这里说明才加上的）时，我一下子没转过弯，都傻了。啥玩意啊？`person` 这个变量哪里冒出来的？后来才想到那里的匹配，应该相当于是这样的情况：  

`%{ likes: something } = person = man = ken`


### 函数的匹配

作为一门函数式编程语言，怎么能不提到递归。Elixir 的模式匹配和递归配合起来使用，实在是太爽了。完全不必用到 `if else` 之流来判断边界值，代码表达得相当优雅。  

我觉得，递归可以说非常好地体现了 First Principle 原则。只有看透数据处理的本质，才能理解递归。我们来看看书中的一句霸气的话吧：  

>L. Peter Deutsch once penned, “To iterate is human, to recurse divine.”

什么意思？“使用遍历的是普通人，能用递归的是神”。  

递归思想在 Elixir 里面是如此地深入骨髓，连列表也可以表达为：`[ head | tail ]`。也就是说，一个列表，就是最开头的一个元素，拼上后面的列表。  

充分了解了这些后，我的感觉和 Dave 在书里表达的一样：  

>that’s certainly the way I felt when I first started coding Elixir. The joy of pattern-matching lists in sets of recursive functions drove my designs. After a while, I realized that perhaps I was taking this too far.

好吧，还是先擦一擦口水，来看一个简单的递归和函数的模式匹配吧：  

```elixir
defmodule Recursion do
  def sum(0), do: 0
  def sum(n), do: n + sum(n - 1)
end

IO.puts Recursion.sum(5)  # => 15
```

这个函数计算了某个给定数字之下的所有正整数之和。以上的例子就是计算 `5+4+3+2+1+0`。  

能理解上面这个方法的，可以尝试猜一猜下面的程序是干嘛的，我就不解释了。  

```elixir
defmodule Chop do
  defp match(actual, min, max) when actual === min or actual === max do
    IO.puts actual
  end
  defp match(actual, min, max) when actual > min and actual <= (div(max + min, 2)) do
    IO.puts "Is it #{(div(max + min, 2))}?"
    match(actual, min + 1, div(max + min, 2))
  end
  defp match(actual, min, max) when actual > div(max + min, 2) and actual < max do
    IO.puts "Is it #{div(max + min, 2)}?"
    match(actual, div(max + min, 2) + 1, max - 1)
  end
  def guess(actual, _) when not is_integer(actual) do
    IO.puts "Guess value #{actual} is not integer"
  end
  def guess(actual, min..max) when actual < min or actual > max do
    IO.puts "Guess value #{actual} is out of the range #{min}..#{max}"
  end
  def guess(actual, min..max) do
    match(actual, min, max)
  end
end

Chop.guess(512, 1..1000)
```

## 完善的工具，和开发规范

作为一个新兴的小众语言，真没想到它还有非常丰富的辅助工具，包括调试，测试，代码依赖分析，发布管理，服务器监控等。如作者所说，这都是因为 Elixir 继承了 Erlang 的财富，和开发社区对工具的重视。  

当前我了解的还很少，初步印象深刻的是它的测试功能。它连文档中的代码块都能测试（据说是借鉴 Python 的）。  

很多程序员都抱怨文档没人写，写了也跟不上代码的变化。Elixir 的这个功能可以比较好地减少这种情况。虽然 JAVA 和 JavaScript 好像也有类似的包，但是都不太完善，也不是官方支持。而且 JAVA 这种以类为基础，动不动还要初始化对象什么的，写起来太累赘了。Elixir 的函数式风格就能很简洁地写出测试的验证代码。  

它的格式大概是这样：  

```elixir
@doc """
提供的 `actual` 是在区间 `min..max` 中的某一个数字，本方法一步步猜测 `actual` 的值是什么。

## Example

  iex> Chop.guess(512, 1..1000)
  "Is it 500?"
  "Is it 750?"
  "Is it 626?"
  "Is it 564?"
  "Is it 534?"
  "Is it 519?"
  "Is it 512?"
  "512"
"""
def guess(actual, min..max) do
  match(actual, min, max)
end
```

另外，Elixir 和 Ruby 差不多，有一定的开发规范可以遵循。这有助于统一风格，提高开发效率。  

Elixir 更强大的编写并发代码的能力我还没有接触到，但估计更加精彩。所以，我决定今后的 Pet Project 都会从 Node.js 改成 Elixir 来写，并期待能有拿它来写 Serious Project 的机会。  

[练习题解答]: https://github.com/kenspirit/programming-elixir-exercises  

有兴趣一起学习的朋友，可以看看我看书后做的[练习题解答][]。  

[编程是什么？我要学吗？]: http://www.thinkingincrowd.me/2016/08/28/What-is-programming-should-I-learn/  
[学习编程需要具备的基本能力 - 抽象]: http://www.thinkingincrowd.me/2016/09/15/Capability-for-Learning-Programming-Abstraction.md/  

相关文章：  

[编程是什么？我要学吗？][]
[学习编程需要具备的基本能力 - 抽象][]
