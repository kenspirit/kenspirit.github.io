title: 学习编程需要具备的基本能力 - 抽象
date: 2016-09-15 17:25:49
tags:
  - Programming
categories:
  - Think
---

很多人说，要学好编程，需要有抽象的能力。但_抽象_这个词本身就太抽象了。怎么样才叫有抽象的能力啊？。**抽象是相对于具象而言的**。我觉得，与其说学习编程要具备抽象的能力，不如说**编程应该具备具象与抽象之间转换的能力**。我们通过下面的例子来了解怎么在这两者之间转换吧。这篇文章对学编程的新手来说可能有点高能，但慢慢理解。

[编程是什么？我要学吗？]: http://www.thinkingincrowd.me/2016/08/28/What-is-programming-should-I-learn/

## 数据与算法

一般来说，计算机和编程最终都会落实到解决生活的具体问题上。把这些生活的具象映射到计算机的程序代码里面，本身就是一次抽象的过程。最基本的抽象，莫过于把具象的物体，赋予抽象的数据和结构，当然还有处理这些数据的算法。数据结构和算法的简单类比和介绍，编程和写作的对比，可以参看之前的一篇文章[编程是什么？我要学吗？][]。

生活中我们很可能就会应用到一些算法。假如公司有 1000 人吧，打印了 1000 张有序号的表格发出去让大家填了。如果收回来都乱了，怎么能快速整理好？很简单，把小于 500 的放左边，大于 500 的放右边，先分开两块。然后再把两边的，再对半分。一直到最后两到某种程度，比如每一叠都只剩下 10 - 20 张的时候，稍微排一下序就好了。最后全部按顺序叠在一起就好。这种做法抽象出来就类似经典的**快速排序**算法。

如果我们再往上抽象一层，其实它属于**分治法**（Divide and conquer）。根据 Wiki 的解释：

>“分而治之”，就是把一个复杂的问题分成两个或更多的相同或相似的子问题，直到最后子问题可以简单的直接求解，原问题的解即子问题的解的合并。

分治法是多分支**递归**的一种形态。很多人在学习编程的时候，会觉得递归非常难理解。但是，如果紧紧抓住这个分治法的核心，怎么把复杂问题分解成相似的子问题，并合并所有的子问题的解答，就会容易很多。

比方说，我在自己正在写的 JavaScript 入门书里面举的例子，如果我们要计算 `1 + 2 + 3 + ... + 8 + 9 + 10` 这个算式怎么做？我们当然可以像人工点计算器那样，一直简单地重复加下去。但是，我们还可以换成这个思路来理解。上面的算式，其实也就是 `10` 和算式 `1 + 2 + 3 + ... + 8 + 9` 的和；算式 `1 + 2 + 3 + ... + 8 + 9` 其实又是 `9` 和算式 `1 + 2 + 3 + ... + 8` 的和，以此类推。

这种思路其实就是分治的思路。那么，如果我们稍微抽象一下，用一个简单的符号来表示最开始那个要计算的算式，比如 `additionOfNumbersUpTo(10)`。它其实就等价于 `10 + additionOfNumbersUpTo(9)` 了。这样理解的话，你们应该就可以看懂这段用 JavaScript 写的递归函数代码了。

```javascript
    function additionOfNumbersUpTo(max) {
      if (max == 1) {
        return max
      } else {
        return max + additionOfNumbersUpTo(max - 1)
      }
    }
```

## 模式、范例

学习编程语言，最常听到的就是各种模式或者范式。下面简单抽几个最出名的例子来说明一下。

### 命令式、声明式

编程语言有两大范式：命令式和声明式。怎么理解呢？我们继续看具体的例子。比如说，我们要实现一个简单的网页效果，在浏览器上显示如下的文本样式。  

* Cake  
* Fruit  
* Steak  

**命令式写法**

```html
<ul id="foodList">
</ul>
<script>
  var food = ['Cake', 'Fruit', 'Steak']

  var foodListElement = document.getElementById('foodList')
  for (var i = 0; i < food.length; i++) {
    var child = document.createElement('li')
    child.innerHTML = food[i]
    foodListElement.appendChild(child)
  }
</script>
```

上面的代码是什么意思呢？  

1. `var foodListElement = document.getElementById('foodList')`。帮我把 ID 为 `foodList` 的东西找到，先放到一个叫 `foodListElement` 的地方。  

2. `for (var i = 0; i < food.length; i++) { ... }`。按照 `food` 的数量，把 `{}` 里面的那一段重复做几次。  

3. `var child = document.createElement('li')`。创造一个叫 `li` 的东西。  

4. `child.innerHTML = food[i]`。把它里面要显示的文字，设置为第几个事物的名字。  

5. `foodListElement.appendChild(child)`。把这个新创造出来的 `li`，放到之前找到的 `foodListElement` 里面。  

所以，**命令式编程强调地是把如何完成一项任务的具体步骤都列出来**。要像下达指令一样，告诉电脑第一步做什么，第二步做什么，最后达成你的目标。这里有一个地方是声明式的，就是 HTML 的 `<ul id="foodList">`。

**声明式写法**

```html
<ul ng-controller="FoodController">
  <li ng-repeat="foodName in food">{{foodName}}</li>
</ul>
<script>
  angular.controller('FoodController', function($scope) {
    $scope.food = ['Cake', 'Fruit', 'Steak']
  })
</script>
```

这一段代码是不是简洁很多？说不定你们都看懂了。  

1. `<ul ng-controller="FoodController">`。`ul` 的行为受一个叫 `FoodController` 的东西控制。  

2. `<li ng-repeat="name in food">{{name}}</li>`。根据 `food` 的数量，重复生成几个 `li`，并且显示相应的食物名字在里面。  

3. `<script>` 里面包含那段就告诉浏览器 `FoodController` 长什么样子，`food` 里面有什么东西。

**指令式编程是指把你只要告诉电脑你要达成的目标是什么，至于怎么做，它自己解决。**这里，我们就不像命令式那样，要一步步教浏览器怎么做了。

要注意的是，这里借助了一个叫 _AngularJS_ 的工具，从而做到了用同一种语言，不同的写法。  **不一定不同的编程语言才有不同的书写范式。同一种编程语言，也可以自己本身有不同的书写范式，或者通过工具来增强改变**。_AngularJS_ 这个工具，就是创作者帮我们抽象了教浏览器如何做事情的过程。

### 面向对象、函数式

要数最热火朝天的编程范式，非这两个莫属了。  前一篇文章[编程是什么？我要学吗？][]里面说过，**算法 + 数据结构 = 程序**。

**面向对象的特点就是，把数据，和相应的处理算法或者说行为都放到一个相应的容器里面。承载数据和行为的容器就是对象**。咋一听可能不好理解。比如，我要在电脑里面模拟一个人，这个人可以看做是一个容器或者对象。他包含了一些数据，一双眼睛，手，腿，黑色的头发等。我们还可以在这个对象上面加上_行走_这样的行为。行走可以根据这个对象有没有手或者腿来决定行走的行为是怎么样的。也可以根据你给不给他穿鞋子，或者穿什么鞋子而不同。  

**函数式里面很重要的一个特点就是，算法本身也可以被看作一种特殊的数据，然后传给其它算法使用**。这个概念如果不看代码的话，真的是不好理解。前方小高能一下。  假设我们有一些数字，我想做两个事情，一个是把它们都乘以 2，一个是算它们的平方。  

下面简单抽象了两个算法 `doubleArray` 和 `squareArray`，每个都是根据传进去的数字进行一个个查看，然后做相应的操作。

```javascript
    var numbers = [1, 2, 3, 4, 5]

    function doubleArray(numbers) {
      var result = []

      for (var i = 0; i < numbers.length; i++) {
        result[i] = numbers[i] * 2 // 乘以 2
      }

      return result
    }

    function squareArray(numbers) {
      var result = []

      for (var i = 0; i < numbers.length; i++) {
        result[i] = numbers[i] * numbers[i] // 乘方
      }

      return result
    }

    doubleArray(numbers)
    // -> [ 2, 4, 6, 8, 10 ]
    squareArray(numbers)
    // -> [ 1, 4, 9, 16, 25 ]
```

_//-> 表示运算结果_

你们如果仔细看的话，上面的 `doubleArray` 和 `squareArray` 只有那么一点点不同啊。如果我们进一步抽象，可以变成下面的样子。  

```javascript
    var numbers = [1, 2, 3, 4, 5];

    function double(num) {
      return num * 2;
    }

    function square(num) {
      return num * num;
    }

    function map(data, fn) {
      var results = [];

      for (var i = 0; i < data.length; i++) {
        results.push(fn(data[i]));
      }

      return results;
    }

    map(numbers, double)
    // -> [ 2, 4, 6, 8, 10 ]
    map(numbers, square)
    // -> [ 1, 4, 9, 16, 25 ]
```

你们可以看到，`double` 和 `square` 把不同的地方抽象出来了。`map` 则是把公共的部分抽象出来了。使用的时候，`double` 和 `square` 被当作数据一样传进去，然后使用。这就是函数式里面一个很重要的高阶函数的概念。  

## 总结

学习编程，到处都是抽象的概念。这个时候，需要我们从抽象到具象的转换来辅助我们的理解和思考。所以，这就是为什么我一开始就强调学习编程是要有具象与抽象之间转换的能力。这个不应该是单向，而是双向的。

具备抽象的思维方式，目的就为能举一反三，解决通用问题。具备这种能力，对解决实际问题都是有很大的用途。所以，这也是为什么我觉得无论是否从事编程领域，都应该学习一定的编程知识。

上面这些如果你都看懂了，你肯定不用担心学不会编程。如果不懂也没有关系，因为它们真的不是那么容易。
