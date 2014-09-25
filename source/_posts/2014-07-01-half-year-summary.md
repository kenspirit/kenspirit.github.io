title: 2014 半年小结
date: 2014-07-31 20:35:17
comments: true
categories:
- Think
tags:
- Retrospect
---

[博客]: http://www.thinkingincrowd.me/algorithm
[Github]: https://github.com/kenspirit/visual-alg
[幻灯片]: http://www.slideshare.net/chengusky/ss-35096187
[ws-monitor]: https://github.com/kenspirit/ws-monitor
[ExtPromise]: https://github.com/kenspirit/ExtPromise
[kanban-cfd]: https://github.com/kenspirit/kanban-cfd
[Coursera]: https://www.coursera.org/
[Data Science]: https://www.coursera.org/specialization/jhudatascience/1

## Coursera

本来今年是要把 _Algorithms 4th Edition_ 这本书看了的。后来机缘巧合的发现在 [Coursera][] 上就有作者本人的教学课程，
所以就直接在上面上课去了。第一部分有6周课程，讲的是基本的算法概念和排序。课程，作业和考试都很有趣。
里面各种可视化来教学的东西让我觉得非常有趣。

上完课后，决定温习一下和用 AngularJS 做点好玩的东西，就把之前看 @左耳朵耗子 哥介绍的可视化排序网站自己做了一下。
放到 [Github][] 和自己的[博客][]上。 没想到这个东西经一些微博上的大牛转发，粉丝涨不少，博客也瞬时增加 2K 多的访问量。
更好玩的是 ZoomQuiet 大妈叫我到珠海 GDG 上面去讲一下做这东西的历程。虽然说最后来听讲的人，因为天气原因，只有 4 个。
但是中间和大妈讨论怎么把演讲[幻灯片][] (要翻墙，在 Slideshare 上) 做好，怎么向小白讲清楚一些细节，可是花了不少心思。


## Data Science

自从在 Coursera 上看到各种可视化的东西后，觉得很有意思，所以想往这方面上去玩一下。因为我觉得如何可视的，简单明了的说明一些问题，很有意思。
在可视化方面，最流行的，莫属于大数据了。虽然我并不热衷于它的流行，但是觉得这确实是应用可视化的一个不错的领域。
无论是个人，还是企业，可视化分析数据都非常有用。所以，就又在 Coursera 上开始了 [Data Science][] 的 Specialization 的学习。

目前还在学习当中，教学用的是 **R** 语言。虽说它是数理统计方面很重要的一门语言，但是可能只是上面支持的数据结构，语法特点很适合做统计用和已经有大量的 API 包的原因。
但我觉得如果作为一门语言，它的语法，包的命名和参数使用相当不统一和协调。**Python** 可能比它更好，而且听说 **Python** 的数理统计能力也很强。
不过可能因为我接触的还是很表面，也没有跳出我的舒适区，所以还没有适应它而已。

话说回来，无论是 **R** 还是 **Python**，它们都只是工具。虽说欲善其事，必利其器，但我觉得重要的是数理统计的思想和提问题的能力。
之后重点学习的应该是基础的统计学和如何对数据思考和提问。这才是要锻炼自己的地方。

## 为公司做的小玩意

其实一直以来就苦恼自己喜欢的玩意没法在公司里派上用场。但是还是一有机会就做一些东西。
这些东西都搞完后，打算和同事们往 JS Unit Test 上面去实践了。
之前是在 Maven 下和项目结合来搞，但是申请加 jar 包去公司的 maven repository 里就麻烦的要死。所以，我们后来用 Node.js 搭起来了，反正在本地想怎么弄都行。目前正在进行中。

**[ExtPromise][]**

这个去年就做出来的了，虽然还没怎么用，之后在项目 Code Review 时，一定要用上去。因为已知有地方需要。

**[ws-monitor][]**

之前老板想解决 QA 和 PP 测试效率的问题，希望可以在这个环节节省时间，让我在其中一个 Release 的后面阶段去留意一下问题在哪，看有什么办法解决。
说实在，问题多得很，这就不细说了，但是在我能力范围内能掌控的，非流程上的东西，可改进地方没多少。
所以我觉得短时间内，就是有个东西检测 WebService 服务是否可用，能在小范围内验证 WebService 结果的正确性上。
花了几天时间，做了这个出来，实测已经达到目的，但是似乎没得到多少人认同，之后自己再往上面加各种测试监控用例，最后再证明给其它人看它的效率。

**[kanban-cfd][]**

做为在公司内用 Kanban 的少数人之一，目前在 Rally 上是没法做出 Kanban CFD (Cumulative Flow Diagram) 图的。所以，我必须手动每天记录各个状态的 WIP 数量。
这个实在是太烦了，也容易出错。除了催别人更新 Rally 的状态，如果还要做这个事情的话，实在太没有效率了。目前 Kanban 实践得很差。
所以，用 Node.js 和 Rally 提供的 WS 来做一个小应用。另一个需求就是老婆那边也希望有类似的东西。等我把这个做出来之后，
就可以看到整个团队的 CFD 图，每个人的 CFD 图和每一个 WIP 的 Kanban cycle 了，还可以作为团队每个成员的效率的比较。想想就觉得不错。
