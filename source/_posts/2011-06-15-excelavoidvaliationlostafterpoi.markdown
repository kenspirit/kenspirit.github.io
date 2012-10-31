---
comments: true
date: 2011-06-15 05:54:07
layout: post
slug: excelavoidvaliationlostafterpoi
title: 如何避免Microsoft Excel在Cell上定义好的Named Validation的下拉选项在POI写值后丢失
wordpress_id: 35
categories:
- Sword
tags:
- Excel
- POI
---

有一种常用的Excel报表打印实现是用客户定义好的Excel Template, 通过POI来写值进去。

这样的好处是基本可以原汁原味的保留Excel的样式和一些宏。

有时，在Excel里会定义有一些Name, 然后用到某一些Cell里做Validation, 也就是模拟下拉选项的效果。

有时候，Excel Template经过POI写值后，会发现那个用Validation做成的模拟下拉选项不见了，而未写值前的Excel Template里是有的。 情况可能是这样：

1.  在做好Excel Template, 保存的瞬间，光标选在的某个有Named List Validation的Cell上。我们要注意，保存Excel Template里，光标必须落在一些空白或不重要的地方。

2. 如果你做的Named List里动态写值的，那最好先做一些dummy的list, 在需要做Validation的Cell上，定义好这个Named List Validation, 然后再把那些dummy value删去。

这样都会有影响，Microsoft的东西有够诡异的了吧？ 哈哈
