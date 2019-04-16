title: 基于特性的测试更接近于第一原理
tags:
  - First Principle
  - Unit Test
categories:
  - Sword
date: 2019-04-16 21:47:23
---


[文章]: https://elixirschool.com/zh-hans/lessons/libraries/stream-data/

最近翻译了一篇[文章][]，里面介绍的是 Elixir 生态下，一个基于特性测试（property-based test）的工具库 StreamData。里面的概念还真是第一次听，也给我带来一些新的想法。强烈建议大家看看，即便你不懂 Elixir 语法，但也不妨碍看懂。

关于单元测试，我自认是没有使用 TDD，也确实写的不多，但也不是没有任何经验（在我的博客 Unit Test 标签下还是有那么几篇文章的）。平时我们写的测试，都是基于用例的单元测试（example-based test）。基于用例的意思，就是选择几种不同的输入值（example），判断输出是否和期望相同。这种做法的不足地方在于，如果开发人员经验不足，选择的用例没有包含极端情况，或边界值，可能就会隐含特定条件下会触发的 bug。

而基于特性的测试可以很好的解决这个问题。那基于特性是什么意思呢？

那篇[文章][]里要测试的函数功能很简单，就是把输入的字符串，列表等数据，按另一个输入的次数，复制多次。函数签名可想象为 `duplicate(source, count)`。加入你输入的参数为 `"a"` 和 `4`，那输出值就是 `"aaaa"`。

平时我们要测试这个函数可能会分别考虑 `source` 为空字符串，`null`值，超长字符，空列表，`count` 为 `0`，正整数，负数等情况，分别写不同的测试用例，尽量覆盖不同的情况。最后的断言（assert）也一般是 `"aaaa" === duplicate("a", 4)` 这样的方式。

但是，当使用基于特性的思维来测试这个函数时，我们要考虑的点就不同了，最后写的断言也不一样。

这个函数的功能，就是把源数据，复制零或多份。所以，它的特性只有这两点：  

1. 返回值的长度，是源数据长度 * `count`（复制次数）
2. 返回值只是源数据的不断重复，不会包含其它任何数据

这就是这个函数的特性。所以，相应的测试用例的断言，也只有这两个。

所以，这种测试代码的编写，你需要做的就是总结出要测试的函数的核心特性。StreamData 这个工具库，则为每一个测试用例生成各种随机数据，并默认运行 100 次，试图帮你找出破坏代码行为的特殊数据。

用这种方法来写测试和断言和平时的做法还是很不一样的，一开始会很不习惯的。但是，我觉的这种思维方式似乎更接近于第一原理的运用，促进深入思考。Elon Musk 是这么说第一原理的：

[first principles]: https://en.wikipedia.org/wiki/First_principle

>[With [first principles][]] you boil things down to the most fundamental truths ... and then reason up from there."  

JavaScript 也有一个基于特性的测试工具库 [JSVerify](http://jsverify.github.io/)，下次写单元测试时我要尝试一下。
