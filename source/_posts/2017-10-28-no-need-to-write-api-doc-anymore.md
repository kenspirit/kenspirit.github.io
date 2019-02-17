title: 怎样可以不用再写接口文档
date: 2017-10-28 23:03:24
tags:
  - API
  - Node.js
categories:
  - Sword
---


## 代码如文档

绝大多数的程序员，其实都不喜欢写文档。即便是一开始写了文档，随着时间的推移，需求的变更，文档很多情况下都慢慢跟不上变化，最后腐烂变质。看文档还不如看代码。

所以，如何维护文档在软件工程一直都是大问题。  后来，有人提出了一种观点：“让你的代码成为文档”。什么意思？如果你竟然还没听说过这个概念，可以看看 [Wiki][] 或者 Martin Fowler 的[文章][]看看：

[Wiki]: https://en.wikipedia.org/wiki/Self-documenting_code

[文章]: https://www.martinfowler.com/bliki/CodeAsDocumentation.html

## 接口 vs 契约

从毕业以来，我做的项目都是前后端一条龙通杀的，从最开始的 vanilla-js，公司内部框架，jQuery, 到 ExtJs。不过，现在很多公司都前后端分离了，前端专职页面，后端提供接口，各司其职。

这种情况下，尤其在大公司里，API 接口文档在合作和沟通层面起非常大的作用。一个好的 API 接口，除了要有良好的命名，统一的风格这样的基本要求外，它接收的参数（数量，格式，限制等），返回值，权限等是更需要关注和保持更新的讯息。一旦这些讯息发生改变，前后端不同步，某个系统功能可能就挂了。所以说，接口文档就是前后端合作契约的说法一点也不夸张。

## 代码生成文档

去年 3 月份，我看到陈天在公众号「程序人生」（programmer_life）的文章「[再谈 API 的撰写 - 契约][]」，很对胃口。我后面就按这样的思路在自己写的 Node.js boilerplate 里面设计了特定的接口定义和编写方式，也在现在的公司一直使用。所有的 HTTP API 都是通过编写描述式的 JSON 来定义的。文档也通过读取这些 JSON 定义来生成。每当接口契约改变，文档就更新了。

那是怎么自动生成的呢？有兴趣的朋友，可以看看我的 Github Repo [joi-route-to-swagger][]：

[joi-route-to-swagger]: https://github.com/kenspirit/joi-route-to-swagger

Repo 里面的 README 阐述了基本的理念和用法。更详细的思路，大家还是看陈天的「[再谈 API 的撰写 - 契约][]」吧。

[再谈 API 的撰写 - 契约]: https://mp.weixin.qq.com/s?__biz=MzA3NDM0ODQwMw==&mid=402114651&idx=1&sn=a7b891f532e29b73afd83f17ae071023&scene=21#wechat_redirect
