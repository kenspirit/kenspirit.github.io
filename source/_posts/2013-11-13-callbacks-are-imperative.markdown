---
layout: post
title: "回调函数是指令式的，Promise 是函数式的：Node 错失的最大机会"
date: 2013-11-13 21:43
comments: true
categories:
- Sword
tags:
- Javascript
- Promise
- Callback
- Functional Programming
- Node.js
---

[Promise]: http://en.wikipedia.org/wiki/Promise_(programming)
[回调]: http://en.wikipedia.org/wiki/Callback_(computer_programming)
[回调无底洞]: http://callbackhell.com/
[协程]: http://en.wikipedia.org/wiki/Coroutine
[monad]: http://en.wikipedia.org/wiki/Monad_(functional_programming)
[可编程分号]: http://en.wikipedia.org/wiki/Monad_(functional_programming)

我之前都有接触过关于 [Promise][] 的一些文章，但是对它的感觉并不大。因为觉得虽然[回调][]风格确实有问题，但我写的代码还没有复杂到那种程度，所以，要去使用的感觉并不强烈。

但是，后面碰到一个问题真的好像用回调的风格来写的话，会比较糟糕。加上看到了这一篇从另一侧面来看 Promise 对函数式编程的思维方面的转变，觉得很不错。值得一看，所以在有其它大神也翻译过的情况下，自己也译一次，顺便深入学习。

原文链接： [Callbacks are imperative, promises are functional: Node’s biggest missed opportunity](http://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/)


> Promise的本质就是他们不随着环境的变化而变化。
>
>   —— Frank Underwood，‘纸牌屋’

你经常会听到说 JavaScript 是一门 "函数式" 编程语言。通常我们这样描述它的时候是因为函数在它里面是作为 "一等公民" 而存在的。但是其它 "函数式" 编程语言里面的特性，比如：数据不可改变，代数类型系统，使用迭代优于循环，避免副作用都统统忽略了。虽然函数作为 "一等公民" 是非常有用的，并且决定用户能够在需要的时候使用函数式风格来编写代码。但是 JS 是函数式的观点却常常忽略了函数式编程的核心思想：面向值编程。

"函数式编程" 的命名其实会产生误导，以至于人们认为它的意义在于，相对于 “面向对象编程” 来说，它是 “面向函数编程”。但是如果面向对象编程是把所有东西都从对象角度考虑，那函数式编程就是把所有东西都作为值来处理，而不仅仅是把函数考虑为值。很明显，数值当然包含那些数字，字符，列表和其它数据值，但其实它也包含其它面向对象编程的粉丝通常没有考虑过的一些东西：IO 操作和其它副作用，GUI 事件流，空值检查，甚至函数调用的顺序。如果你曾经听说过 “[可编程分号][]” 的话，你应该知道我想说的是什么了.

函数式编程最大的好处是它是声明式的。在命令式编程里面，我们需要写一系列的指令来告诉计算机是怎么去实现我们想要做的事情的。在函数式编程里面，我们只是需要描述值之间的计算关系，计算机就会自己想办法得出需要的计算指令顺序。

如果你使用过 Excel 的话，你其实已经用过函数式编程了：你只需要描述一个图表里面的值，是怎么相互计算出来的。当有新数据插入的时候，Excel 就会自己得出图表里有什么地方的值和效果要更新，而你并不需要再为它写出任何指令，它也可以帮你计算出来。

在阐述了这些基本概念的基础上，我想说明一下我觉得 Node.js 在设计上最大的失误是什么: 这就是在它的设计早期，决定了倾向于使用回调风格的 API 而不是 promise 风格.

>所有人都使用回调。如果你发布了一个返回 promise 的模块，根本没有人会关注和使用你那个模块。
>
>如果我写了一个小模块，它需要和 Redis 交互，我所需要做的唯一一件事情就是传递一个回调函数给 Redis。当我们遇到[回调无底洞][]的时候，其实这根本不是什么问题: 因为同样有[协程][]和 [monad][] 无底洞。因为如果你把任何一个抽象使用地足够频繁的话，都同样会创造一个无底洞。
>
> 在 90% 的情况下，你只需要做一件事情，回调如此简单的接口使得你只是需要简单的缩进一下就可以了。如果你遇到了非常复杂的用例，你和其它在 npm 里面的 827 个模块一样，使用 async 就好了.
>
> —— Mikeal Rogers，LXJS 2012

这段话是从 Mikeal Rogers 最近的一次涵盖了好些 Node 设计哲学的演讲里摘取出来的:

>在 Node 的初期设计目标里面，我希望可以让更多的非专家级别的程序员可以很容易编写出快速，支持并行的网络程序，虽然我知道这个想法有点违背生产效率。Promises 其实可以使得程序在运行时自动控制数据流动，而不是靠程序员通过显式指令控制，所以能更加容易组织正确清晰和最大化并行操作的程序.

要写出正确的并行程序基本上需要你实现尽可能多的并行工作的同时，保证操作指令还是以正确的顺序执行。虽然 JavaScript 是单线程的，但我们依然有可能因为在异步操作的情况下触发了竞争机制: 任何涉及 IO 的操作都会在它等待回调的时候把 CPU 时间腾到其它操作上面。多个并发操作就有可能同时访问同一段内存数据，或者产生一系列重叠的操作数据库或者 DOM 的指令。所以，我希望在这篇文章里可以告诉大家，promies 能够像 Excel 一样，提供一种只需要描述值之间的关系模型，你的工具就能够自动寻求最佳解决方案给你。而不是需要你自己控制程序流.

我希望可以清除掉一个误区就是 promises 的使用就是为了让语法结构看起来比基于回调的异步操作更清晰。其实它们可以帮助你用一个完全不同的方式来建模。它们的作用比简化语法来得更深层次。事实上，它们完全从语意角度改变你解决问题的方式。

首先，我想先重温一下几年前写的一篇文章。它是关于 promises 是怎么在异步编程上作为一个 monad 的角色而存在的。这里的核心思想就是 monad 其实是帮助你组织函数的工具，比如说，当一个函数的返回值要做为下一个函数的输入的时候，建立数据管道。数据关系的结构化是实现的关键。

在这里的，我还是需要用到 Haskell 的类型注解来帮助说明一下。在 Haskell 里，注解 foo :: bar 表示 “foo 是 bar 的类型“。注解 foo :: Bar -> Qux 表示 “foo 是一个接受输入值为 Bar 类型和返回值为 Qux 类型的函数“。如果输入输出的类别并不重要的话，我们会用单一小写字母，foo :: a -> b。如果函数 foo 可以接受多个参数的化，我们会添加多个箭头，比如：“ foo :: a -> b -> c ” 表示 foo 接收两个分别为类型 a 和 b 的参数并返回类型 c 的值.

我们来看一个 Node 函数吧，比如，fs.readFile()。这个函数接收一个 String 类型的路径参数，还有一个回调函数，并且没有任何返回值。回调函数会接收一个可能为空的 Error 类型和一个包含了文件内容的 Buffer 类型的参数，并且也没有返回值。那我们就可以把 readFile 的类型用注解表示为:

```haskell
readFile :: String -> Callback -> ()
```

() 在 Haskell 注解中表示空值类型。这里的 callback 是另一个函数，它的注解可以表示为:

```haskell
Callback :: Error -> Buffer -> ()
```

把它们放在一起的话，我们可以说 readFile 接收两个参数，一个 String 类型，一个是接收 Buffer 参数的函数:

```haskell
readFile :: String -> (Error -> Buffer -> ()) -> ()
```

现在，我们来想象一下假如 Node 使用 promises 会是怎么样的。这样的情况下，readFile 可以简单的接收一个 String 类型参数然后返回一个 Buffer 的 promise:

```haskell
readFile :: String -> Promise Buffer
```

一般来说，我们可以认为回调风格的函数接收一些参数和一个函数，这个函数将会被最终调用并传递返回值作为它的输入；promises 风格的函数就是接收一些参数，和返回一个带结果的 promise:

```haskell
callback :: a -> (Error -> b -> ()) -> ()
promise :: a -> Promise b
```

那些回调风格返回的空值其实就是为什么使用回调风格来编程会很困难的根本原因: 回调风格不返回任何值，所以难以组合。一个没有返回值的函数执行的效果其实是利用它的副作用 – 一个没有返回值和利用副作用的函数其实就是一个黑洞。所以，使用回调风格来编程无法避免会是指令式的，它实际上是通过把一系列严重依赖于副作用的操作安排好执行顺序，而不是通过函数的调用来把输入输出值对应好。它是通过人手组织程序执行流程而不是靠理顺值的关系来解决问题的。这正是编写正确的并行程序困难的原因.

相反，基于 promise 的函数总是让你把函数返回值作为一个不依赖于时间的值来考虑的。当你调用一个回调风格的函数时，在你的函数调用和它的回调函数被调用之间，在程序里面我们没办法找到一个最终结果的表现形式.

```javascript
fs.readFile('file1.txt',
  // some time passes...
  function(error，buffer) {
    // the result now pops into existence
  }
);
```

从基于回调和事件的函数里面取得结果基本上意味着 “你必须在恰当的时间和地点”。如果你在事件被触发之后才绑定你的事件监听器，或者你没有在恰当的地方回调你的函数，那么恭喜你，你将无法得到你要的结果了。这些事情使得人们在 Node 里写 HTTP 服务器相当困难。如果你的控制流不对，你的程序就无法按期望运行.

相反，Promises 并不关心执行的顺序。你可以在 promise 兑现前或后注册监听器，但你总能拿到它的返回值。因此，那些马上返回的 promises 其实是给了你一个代表结果的值，让你可以把它当作一等公民，然后传递给其它函数。中间不需要等待一个回调或任何丢失事件的可能性。只要你手中拿着一个 promise 的引用，你就能从它得到你想要的值.

```javascript
var p1 = new Promise();
p1.then(console.log);
p1.resolve(42);

var p2 = new Promise();
p2.resolve(2013);
p2.then(console.log);

// prints:
// 42
// 2013
```

即便 then() 这个方法似乎隐含一些关于操作顺序 – 事实上这只是它的副作用 – 你可以把它想象成叫做 unwrap。Promise 是一个未知值的容器，那么 then 的工作就是从 promise 中把值取出来并交给另一个函数: 它其实是 monad 的 bind 函数。其实上面的代码里没有任何地方提及什么时候这个值是存在的，或事情是按照什么顺序发生的，它只是表达了一些依赖关系在里面: 你必须首先知道那个值是什么，然后才能够把它打印出来。程序的顺序是从值的依赖关系中衍生出来的。这里其实只有很小的区别，我们在后面讨论到延迟 promise 的时候会看得更清楚.

到目前为止，这些区别都很微小；很少函数单单和其它函数交互。我们现在来处理一些复杂一点的问题，以便看到 promises 更加强大之处。假设我们现在有一些代码，通过使用 fs.stat() 来取得一些文件的 mtimes。如果是同步的操作，我们只是需要调用 paths.map(fs.stat) 就可以了，但是因为用 mapping 来处理异步的问题是很困难的，我们看看用上 async 模块是什么样子.

```javascript
var async = require('async'),
    fs    = require('fs');

var paths = ['file1.txt'，'file2.txt'，'file3.txt'];

async.map(paths，fs.stat，function(error，results) {
  // use the results
});
```

(是的，我知道 fs 的函数有同步版本，但大多数涉及 I/O 的操作都没法这么做，就陪我玩一玩吧。)

这样看起来都还不错，直到我们决定要拿到 file1 的大小来做其它不相关的任务的时候。当然，我们可以再拿一次那个文件的状态:

```javascript
var paths = ['file1.txt'，'file2.txt'，'file3.txt'];

async.map(paths，fs.stat，function(error，results) {
  // use the results
});

fs.stat(paths[0]，function(error，stat) {
  // use stat.size
});
```

这样显然没有问题，但是我们现在取了那个文件的状态两次。当然，本地的文件操作是没有问题的，但如果我们正在通过 https 来获取大文件的时候，那麻烦就大了。所以，我们只能访问文件一次。这样，我们就要修改一下前面的代码来特殊处理一下第一个文件:

```javascript
var paths = ['file1.txt'，'file2.txt'，'file3.txt'];

async.map(paths，fs.stat，function(error，results) {
  var size = results[0].size;
  // use size
  // use the results
});
```

这初看也没有问题，但是获取文件大小的任务就必须等到整个列表都处理完了才能够开始。如果其中任何一个文件处理出错，我们就无法得到第一个文件的结果了。这种方案并不好，那我们来试一试另一种方式: 我们把第一个文件分开单独处理.

```javascript
var paths = ['file1.txt'，'file2.txt'，'file3.txt'],
    file1 = paths.shift();

fs.stat(file1，function(error，stat) {
  // use stat.size
  async.map(paths，fs.stat，function(error，results) {
    results.unshift(stat);
    // use the results
  });
});
```

这样当然可行，但是现在我们的程序并不是并行的了: 它将需要更长的时间去运行，因为我们必须等到第一个文件处理完才能开始处理那个列表里的文件。之前，它们都是同步进行的。还有，我们现在还必须对第一个文件特殊处理而引入一些数组的操作.

好吧，最后一击。我们现在要做的是得到所有文件的详情，每个文件只读取一次，如果第一个文件读取成功了我们要做些特殊处理，并且如果整个列表里的文件都处理成功，我们要对整个列表再进行一些操作。让我们用 async 来在代码里表达出这个需求的依赖关系看看.

```javascript
var paths = ['file1.txt'，'file2.txt'，'file3.txt'],
    file1 = paths.shift();

async.parallel([
  function(callback) {
    fs.stat(file1，function(error，stat) {
      // use stat.size
      callback(error，stat);
    });
  },
  function(callback) {
    async.map(paths，fs.stat，callback);
  }
]，function(error，results) {
  var stats = [results[0]].concat(results[1]);
  // use the stats
});
```

好了，这样就达到要求了: 每个文件只读取一次，所有的工作都是并行处理的，我们也可以独立的访问第一个文件的结果，并且相互依赖的任务都是尽早执行完毕的。搞定!

其实，并不能说完全搞定了。我认为这样的代码真的很丑陋，并且当问题变的复杂的时候，这样的代码很难扩展。为了让它正常工作，我们需要考虑大量的代码执行顺序问题。 而且设计意图并不明显以至于后面的维护很可能会不经意把它破坏掉。当我们引入了一个特殊需求后，原本问题的解决策略被迫同一些后续的跟进操作混杂在一起，并且我们还要对数组作出那么恶心的操作。

所有的问题其实都来自于我们尝试通过控制程序流来作为主要的解决问题的手段，而不是依赖于数据之间的关系。不是说 “为了能够运行这个任务，我需要这个数据”，并让运行环境去寻找优化手段，而是显式声明运行时什么应该并行，什么应该串行，所以导致我们的解决方案是如此脆弱.

那么，promises 如何改善这种情况呢? 我们需要一些操作文件系统的函数是可以返回 promises 而不是接收一个回调函数的。但是与其手写一个这样的函数，我们可以用元编程的方式写一个函数，使得它可以转换任何其它函数返回 promises。比如说，它可以接收如下一个函数定义为

```haskell
String -> (Error -> Stat -> ()) -> ()
```

并且返回以下类型

```haskell
String -> Promise Stat
```

下面就是这个元编程的函数:

```javascript
// promisify :: (a -> (Error -> b -> ()) -> ()) -> (a -> Promise b)
var promisify = function(fn，receiver) {
  return function() {
    var slice   = Array.prototype.slice,
        args    = slice.call(arguments，0，fn.length - 1),
        promise = new Promise();

    args.push(function() {
      var results = slice.call(arguments),
          error   = results.shift();

      if (error) promise.reject(error);
      else promise.resolve.apply(promise，results);
    });

    fn.apply(receiver，args);
    return promise;
  };
};
```

(这还不是一个通用方案，但是足够在我们的场景里使用了.)

我们现在可以重新对我们的业务问题建模。我们基本上要做的就把一个列表的文件路径，转换为一个列表的文件状态 promises:

```javascript
var fs_stat = promisify(fs.stat);

var paths = ['file1.txt'，'file2.txt'，'file3.txt'];

// [String] -> [Promise Stat]
var statsPromises = paths.map(fs_stat);
```

从这里就可以看出分别了: 通过使用 async.map() ， 你必须等到整个列表处理完了，你才能拿到数据进行处理。但是如果你有了一个列表的 promises，你可以直接拿第一个 promise 来操作:

```javascript
statsPromises[0].then(function(stat) { /* use stat.size */ });
```

所以，通过使用 promise，我们把大部分问题都解决了: 我们并行得到所有文件的状态，并且可以独立访问并不止第一个文件，可以是任何一个文件，而这只需要指定某个数组位就可以了。通过前一种方法，我们需要显式写逻辑特殊处理第一个文件，而且考虑怎么拿到那个文件还非常费事。但是，通过一个列表的 promises 就很容易了.

当然，这里缺少的部分是当所有的文件状态信息都拿到后，我们应该怎么处理。通过前面，我们得到了一个列表的 文件状态值对象，但这是一个列表的 promises。我们需要等到所有的 promises 都处理完后，拿到一个列表的文件状态。也就是说，我们要把一个列表的 promises 转化成一个 promise 对应于整个列表.

让我们看看一个简单的 list 方法是怎么做到可以把一个包含了 promises 的列表转化成一个 promise，而且当它里面所有的 promises 都处理完后，它自己也处理了.

```javascript
// list :: [Promise a] -> Promise [a]
var list = function(promises) {
  var listPromise = new Promise();
  for (var k in listPromise) promises[k] = listPromise[k];

  var results = []，done = 0;

  promises.forEach(function(promise，i) {
    promise.then(function(result) {
      results[i] = result;
      done += 1;
      if (done === promises.length) promises.resolve(results);
    }，function(error) {
      promises.reject(error);
    });
  });

  if (promises.length === 0) promises.resolve(results);
  return promises;
};
```

_(译者注：这里感觉好像 promises 和 listPromise 几个地方反了。作者没开评论，无法确认，不过有时间试一下代码就知道了。)_

(这个方法其实和 jQuery.when() 函数类似，它同样接收一个列表的 promises 并返回一个新的 promise。当这个 promise 所有的输入都处理完后，它自己也处理了.)

我们现在就可以通过把数组包装成一个 promise，然后等所有的处理结果出来就可以了:

```javascript
list(statsPromises).then(function(stats) { /* use the stats */ });
```

那么我们完整的解决方案就会是这样:

```javascript
var fs_stat = promisify(fs.stat);

var paths = ['file1.txt'，'file2.txt'，'file3.txt'],
    statsPromises = list(paths.map(fs_stat));

statsPromises[0].then(function(stat) {
  // use stat.size
});

statsPromises.then(function(stats) {
  // use the stats
});
```

这个解决方案的表达就相当的简洁清晰了。通过一些通用的辅助函数和既有的数组操作函数，我们用一种正确的，有效并且容易调整的方法来实现了。我们也不需要 async 模块的特殊集合类函数，我们只需要让 promises和数组两者的思想相互独立，并通过一种强大的方式把它们组合使用就可以了.

特别要注意的是，我们的程序在这里并没有说任何部分是应该是并行还是串行处理的。我们只是描述了我们想要什么，任务之间的关系是怎么样的，剩下的都是 promise 组件帮我们优化的.

事实上，很多在 async 的集合类模块可以很容易用一个列表的 promises 来替代。我们已经看到过 map 是怎么工作的了; 下面的代码:

```javascript
async.map(inputs，fn，function(error，results) {});
```

和下面的是一样的:

```javascript
list(inputs.map(promisify(fn))).then(
    function(results) {},
    function(error) {}
);
```

async.each() 其实就是用 async.map()，然后利用那些被执行的函数的副作用，而把它们的返回值舍弃掉; 你用 map() 就可以了.

async.mapSeries() (如前所述，async.eachSeries()) 其实就是对一个列表的 promises 上调用 reduce()。那就是，它你的输入列表，使用 reduce 来得到一个依赖于前面 promise 的操作成功后再执行的 promise。我们来举个例子: 实现一个基于 fs.rmdir() 的程序来实现和 rm -rf 相同的功能。下面的代码:

```javascript
var dirs = ['a/b/c'，'a/b'，'a'];
async.mapSeries(dirs，fs.rmdir，function(error) {});
```

和下面的是一样的:

```javascript
var dirs     = ['a/b/c'，'a/b'，'a'],
    fs_rmdir = promisify(fs.rmdir);

var rm_rf = dirs.reduce(function(promise，path) {
  return promise.then(function() { return fs_rmdir(path) });
}，unit());

rm_rf.then(
    function() {},
    function(error) {}
);
```

这里的 unit() 只是一个简单的返回一个已经处理的 promise 来开始整个操作链 (如果你知道什么是 monads，这个就是 promises 的返回函数):

```javascript
// unit :: a -> Promise a
var unit = function(a) {
  var promise = new Promise();
  promise.resolve(a);
  return promise;
};
```

这个使用 reduce() 的方案简单的使用接收列表中的两个路径值，并使用 promise.then() 来确保前面的文件夹删除成功之后，再删除后面的文件夹。这其实还帮你处理了非空文件夹的情况: 如果前面的 promise 因为任何错误而无法处理，那么整个处理流程就停止了。使用值的依赖关系来强制某种执行顺序是函数式编程使用 monads 来处理副作用的核心思想.

最后的代码似乎比同样功能的 async 代码更啰嗦，但别因为这样蒙骗了你。最重要的思想是我们通过使用 promise 数值和列表操作来组合程序，而不是依赖于特别的库来控制程序流。正如我们前面看到的，前一种方式可以写出更容易理解的程序.

前一种程序更容易理解是因为我们把我们思考流程的一部分交给机器去做了。当使用 async 模块的时候，我们的思考流程是这样的:

A. 在程序里，我们的任务应该是这样相互依赖的,  
B. 因此，应该要这样把操作组织好,  
C. 那么，我们现在用代码来表现 B 所描述的流程.  

利用相互依赖的 promises 可以让你完全把 B 那步抛弃掉。你的代码只需要表达出任务的相互关系就可以了，然后让电脑来决定处理流程。换另一个说法就是，回调风格是显式的控制处理流程来把很多值组织在一起，而 promises 是显式表达出值的关系来把控制流的各个组件连接在一起。回调是指令式的，promises 是函数式的.

这个主题的讨论只有当我们谈到 promises 的最后一个使用场景，也就是函数式编程的核心思想，延时性，才算完整。Haskell 是一种惰性语言。它和那些从上往下执行的脚本程序不一样，它是从定义了程序最终输出的表达式开始的 – 有什么需要写到标准输出，数据库等，然后反回来向前执行。它首先看最终的表达式是依赖哪些表达式来取得它们的输入值的，然后一直往前遍历整棵树图，直到整个程序为了它的输出结果反过来计算出所需的所有数据为止。只有需要用到的数据才会在程序里计算出来.

很多时候，计算机领域的问题，最后找到的最佳解决方案都是需要找到最佳的数据结构来建模而得出来的。JavaScript 里有一个跟我刚才描述的情况非常相似的问题: 模块加载。你只想加载那些你的程序需要用到的模块，并且希望越快越好.

在我们有 CommonJS 和 AMD 这类有了依赖关系意识的规范前，我们有好一些脚本加载库。它们基本的工作原理都是像我们上面的例子一样，通过显式向加载器声明你要加载的脚本哪些是可以并行下载的，哪些是一定要按某种顺序下载。你基本上都要说清楚下载的策略，要正确并有效的做好的是相当困难的。相反，通过描述脚本之间的依赖关系来让加载器优化下载策略就会容易很多.

现在让我们来看看怎么实现 LazyPromise 的。这是一个 Promise，包含了一个可能会做异步操作的函数。这个函数只有在被调用 then() 这个方法的时候会被执行一次: 我们只有在有需要得到返回结果的时候才会开始执行。我们通过重写 then() 来判断一下如果还没有开始过的话就执行操作.

```javascript
var Promise = require('rsvp').Promise,
    util    = require('util');

var LazyPromise = function(factory) {
  this._factory = factory;
  this._started = false;
};
util.inherits(LazyPromise，Promise);

LazyPromise.prototype.then = function() {
  if (!this._started) {
    this._started = true;
    var self = this;

    this._factory(function(error，result) {
      if (error) self.reject(error);
      else self.resolve(result);
    });
  }
  return Promise.prototype.then.apply(this，arguments);
};
```

比如说，下面这个程序什么也不会做: 因为我们没有向 promise 取值，没有需要执行任何操作:

```javascript
var delayed = new LazyPromise(function(callback) {
  console.log('Started');
  setTimeout(function() {
    console.log('Done');
    callback(null，42);
  }，1000);
});
```

但是如果我们添加了下面这一行代码，那么程序就会打印出 Started，然后一秒后再打印出Done，最后打印出42:

```javascript
delayed.then(console.log);
```

因为中间的异步操作是只处理一次的，所以调用 then() 多次会打印最终结果多次，但不会每次再执行异步操作:

```javascript
delayed.then(console.log);
delayed.then(console.log);
delayed.then(console.log);

// prints:
// Started
// -- 1 second delay --
// Done
// 42
// 42
// 42
```

通过把以上简单的通用操作抽象出来，我们很容易就可以打造一个模块优化系统。想象一下我们要把一系列的模块这样处理一下: 每一个模块创建时都绑定了一个名字，一个它依赖的模块列表，和一个构造函数。这个构造函数会在执行时被传入所依赖的模块作为参数，然后返回本身这个模块的 API。这其实和 AMD 工作模式类似.

```javascript
var A = new Module('A'，[]，function() {
  return {
    logBase: function(x，y) {
      return Math.log(x) / Math.log(y);
    }
  };
});

var B = new Module('B'，[A]，function(a) {
  return {
    doMath: function(x，y) {
      return 'B result is: ' + a.logBase(x，y);
    }
  };
});

var C = new Module('C'，[A]，function(a) {
  return {
    doMath: function(x，y) {
      return 'C result is: ' + a.logBase(y，x);
    }
  };
});

var D = new Module('D'，[B，C]，function(b，c) {
  return {
    run: function(x，y) {
      console.log(b.doMath(x，y));
      console.log(c.doMath(x，y));
    }
  };
});
```

现在我们有了一个钻石模型图: D 依赖于 B 和 C，而它们两个又依赖于 A。这就意味着我们可以加载 A，然后并行加载 B 和 C，当 B 和 C 都加载完后，我们就可以加载 D 了。但是，我们希望我们的工具可以帮我们计算出来，而不是我们自己来实现这个策略.

我们可以通过把模块建模为 LazyPromise 的子类后很容易的实现。它的构造函数可以通过使用前面的列表 promise 辅助函数来取得它的依赖模块，然后在某一个延时后创建这些依赖模块来模拟异步加载的延时效果.

```javascript
var DELAY = 1000;

var Module = function(name，deps，factory) {
  this._factory = function(callback) {
    list(deps).then(function(apis) {
      console.log('-- module LOAD: ' + name);
      setTimeout(function() {
        console.log('-- module done: ' + name);
        var api = factory.apply(this，apis);
        callback(null，api);
      }，DELAY);
    });
  };
};
util.inherits(Module，LazyPromise);
```

因为 Module 是一个 LazyPromise，单纯定义模块并不会加载任何东西回来。只有当我们需要开始使用的时候，加载才会执行:

```javascript
D.then(function(d) { d.run(1000，2) });

// prints:
//
// -- module LOAD: A
// -- module done: A
// -- module LOAD: B
// -- module LOAD: C
// -- module done: B
// -- module done: C
// -- module LOAD: D
// -- module done: D
// B result is: 9.965784284662087
// C result is: 0.10034333188799373
```

正如你所见到的，A 首先加载，当它完成后 B 和 C 开始同时下载，然后当它们都加载完后  D 开始加载，正如我们想要的那样。如果你只是执行 C.then(function() {})，你可以看到只有 A 和 C 加载; 关系图里没需要用到的是没有加载的.

所以，基本上不需要太多代码，只需要定义好懒 promises 的关系图，我们就实现了一个正确的模块加载器。我们使用的是函数式编程里面的定义值的依赖关系这种方式，而不是显式控制程序执行顺序的方式来解决问题，并且这种方式比起自己控制执行流程更加容易。你可以给出任何非循环依赖关系图来让这个模块加载库帮你优化执行顺序.

这才是 promises 的真正强大之处。它们并不仅仅从语法层面减少代码嵌套。它们让你再更高的层面来为你的问题抽象建模，和让你的工具帮你做更多的工作。事实上，那应该是我们必须向我们的软件提出的要求。如果 Node 真的希望把并行编程更容易的话，它们应该重新考虑一下 promises.
