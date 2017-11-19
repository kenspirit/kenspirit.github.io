title: 一个简单的支付业务与模型演变
date: 2017-11-11 21:42:28
tags:
  - DDD
  - Data Modeling
  - Design
categories:
  - Sword
---


[Node.js 微信后台搭建系列 - 数据建模]: http://www.thinkingincrowd.me/2016/11/13/Node-js-Wechat-Web-App-Tutorial-Data-Modeling/
[Domain Driven Design - Tackling Complexity in the Heart of Software]: https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215/ref=sr_1_1

最近在看 Eric Evans 的 [Domain Driven Design - Tackling Complexity in the Heart of Software][] 这本书。为了能更深入理解里面的概念，我大致捋了一下最近做的系统里支付模块的演变，希望等不断深入这本书后再重新审视一下目前的设计，看如何改进。  

之前写教程 [Node.js 微信后台搭建系列 - 数据建模][] 的时候，一些同学对建模没什么概念。希望这篇文章也能让编程初学者初步理解如何建模，如何随着业务的改变而调整模型。  

下面的一些模型图，和字段名称，我觉得它们的命名应该能表达清楚它们的用途了吧？我就不逐个字段解释了。这里也只是列出最主要的信息而已。一些辅助的，系统流程控制的字段和业务关系不大，主要是取决于实现的方式，也就不列出来了。  


## 原始阶段

在我们的系统刚开始实现的时候，由于业务比较简单，支付模块实现的比较简单：  

1. 微信和我们系统按 T+1 来结算。所以，我们也是直播结束后第二天就把收入拨给主讲人。  

2. 直接在用户表里用 balance 字段表示账户余额。  

3. 只有一个 payments 表。这个表揉合了基本的订单信息，和支付状态信息。  

这样设计的其它考虑是：  

第一，我们并没有普通电商平台那样的购物车，和订单流程。用户如果遇到心仪的课程，他只需要点击购买，支付，然后就可以在他的已购列表看到刚购买的课程了。  

第二，我们用的是 MongoDB。MongoDB 没有 transaction 和 join 的概念。如果把订单和支付信息切分到不同的 collection，操作会变复杂，并还有可能由于操作或数据库错误导致数据不完整。  

所以，最开始的支付模块模型大致如下图。后台有定时 Job 用来计算主讲人收入，和他的各个直播收益的。  

![Payment Modeling Phase 1](http://thinkingincrowd.u.qiniudn.com/payment-module-design-phase-1.png)


## 冻结部分收益

到了第二个阶段，出现了一些问题需要我们面对：  

1. 因为我们售卖的是虚拟商品，微信把我们系统的到帐改为 T+15 了。  

2. 随着直播数的增加，和主讲人资质的放宽，单纯靠运营人员人工根据直播情况来把控主讲人的提现需求越加困难。  

业务上我们也相应要做出调整：  

1. 主讲人的每一个直播，首笔收益到帐时间为直播结束后 15 天。之后用户的每一笔支付，也延后 15 天才能到帐。  

2. 由于主讲人收入到帐时间大为延长，为了让主讲人更清晰了解他的收入情况，我们为主讲人提供每天收入明细，展示每个直播冻结中，和已经结算的收益情况。  

因此，原来的模型扩展为如下的情况：  

1. 添加了 `transactions` collection。它的作用是存放每天聚合了的 `payments` 数据，为主讲人提供每天收入明细，并记录哪些收益还在冻结中，哪些可以释放出来。  

2. `users` 和 `products` 加上 `frozenProfit` 和 `totalProfit`。这两个字段都是从 `transactions` 里面的数据演算得出的。  

![Payment Modeling Phase 2](http://thinkingincrowd.u.qiniudn.com/payment-module-design-phase-2.png)


## 分销

某一天，CTO 和我说，我们需要实现分销的功能。就这么一句话，你们觉得怎么做？要几天？模型需要改吗？  

模型肯定要变了。为什么？因为不仅仅是直播商品的拥有人，其它的用户都有可能拥有收入。那么，收益相关的数据 `frozenProfit`, `totalProfit` 也就不能简单地附着在商品数据，也就是 `products` collection 里面了。  

所以，我抽出新的 `revenue_summary` collection 来存放每个用户在某个商品上能获取的收益，和收入来源。当然，`products` 里的相应字段也就不需要了。  

![Payment Modeling Phase 3](http://thinkingincrowd.u.qiniudn.com/payment-module-design-phase-3.png)


## 多商户商品打包

随后，我们又支持了多商户商品打包售卖的需求。  

身为一个平台，在搞活动的时候，我们需要打包优惠出售多个商户的商品。虽然说上面的模型也能基本满足要求，不需要太大的变动也能支持，但是，这种商品的收入计算逻辑，因为涉及多方收入分配，更为复杂，我们觉得还是要做出一些调整。  

我们新增加了一个 `payment_instructions` collection。  

![Payment Modeling Phase 4](http://thinkingincrowd.u.qiniudn.com/payment-module-design-phase-4.png)

这个模型有什么用呢？  

其实，以前每一笔用户支付给我们的买课程的费用，都被分成好几部分：  

1. 微信手续费  
2. 分销渠道费用（如果有的话）  
3. 主讲人分成  
4. 平台分成  

除主讲人分成那部分费用之前有明确记录外（因为需要展示给用户看），其它部分其实都隐含在 Job 的收益计算逻辑里面。虽然说我们可以根据每一笔支付费用的总额，协定分成比等数据计算出其它部分，但是当我们想做数据统计，和对账的时候，就比较麻烦了。所以，现在每一笔费用，在成功处理后，我们把帐目明细都记录下来。  

通过这样的调整，今后的数据统计和对账问题得以解决。而且，作为一个商城，以后如果我们还需要拓展积分，钱包余额支付等功能也更方便清晰。  

[文章]: https://medium.com/airbnb-engineering/scaling-airbnbs-payment-platform-43ebfc99b324

目前这个支付模块还是有点简陋的，再学习怎么优化吧。AirBnB 的支付系统也是面对各种现实问题后不断演进，有兴趣朋友可以看看它们的 Medium [文章][]。
