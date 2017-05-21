title: 学习编程需要具备的基本能力 - 正确提问
date: 2016-09-17 11:18:28
tags:
  - Programming
categories:
  - Think
---

[一点点对提问，分享和影响力的看法]: http://www.thinkingincrowd.me/2013/05/28/how-to-ask-share-and-influence/

这真的是陈词滥调了。网上一搜其实一大堆这些文章，包括自己在 2013 年写的[一点点对提问，分享和影响力的看法][]也提到一些。不过当时是稍微针对已经在公司的人写的，这里为自学的朋友补充一些之前没有提到的。先强调一下，最好用英语和 Google，可以节省大量寻找答案时间。  

## 怎么问

[How To Ask Questions The Smart Way]:http://www.catb.org/esr/faqs/smart-questions.html

这一大点是网络上大部分文章涵盖的内容。[How To Ask Questions The Smart Way][] 写的非常详细，具体可以去仔细看看。我这里把关键的一些点抽出来，并作一些具体解释和增补，因为文章里面很多细节都是围绕这些点展开的。

### 找对地方

这个错一般不会犯的太离谱，因为对于新手来说，也不会说找到什么 IRC，mailing list 等主要为高级技术人员而存在的地方。一般你确定好学习什么语言，在搜索引擎上找 “xxx 论坛” 就能找到一些提问的地方。  

个人首推国外的 http://stackoverflow.com/。这个是综合性网站，需要自己打对标签，要稍微注意别发错地方。

国内的综合性网站可以看看 https://segmentfault.com/ ，http://www.csdn.net/ ，http://www.oschina.net/ 。专业性的有 Ruby 的 https://ruby-china.org ，Python 的 http://www.pythontab.com/ 等。

### 别问愚蠢的问题

程序员基本上来说还算是比较友好和乐于助人的物种。但是如果你提的问题一看就比较白痴，而且是没有自己思考，在加上态度差的话。好的情况是没人理。差的话，分分钟某人以严肃脸，说反话回答的方式把你带坑里去。

怎么样才不至于问愚蠢的问题：

1. 如果你是跟着教程来学习，**请确保认真逐字阅读，别漏了步骤**。当然，也别太死板，全部照抄，有些像用户名什么的还是要改成自己的，但是原教程应该是有说明的。  

2. 自己花时间在搜索引擎，相关论坛认真寻找过，确保没有被解答过的类似问题。为什么说_类似_而不是_相同_？因为很多新手认为相同就真的是要一模一样。但是，为了你自己，请稍微动脑子看看那些类似的问题，看多几个解决方案，你可能就自己找到答案了。  

### 目的是什么

[XY 问题]: http://xyproblem.info/

记得要描述你想实现的效果或者目的，而不仅仅是你的步骤。为什么表达清楚目的很重要。因为有时候你的做法根本就不对，方向错误。搞不好绕半天回来，别人和你说你本来怎么怎么做就可以了，根本不应该这样。这就是典型的 [XY 问题][]。

所以，正确的表达顺序应该是：

* 想做什么  
* 思路/方法  
* 步骤  
* 出错信息/与期望不同的结果  

### 具体信息

在编程软件开发世界，影响结果的因素真的比较多，没有相关信息的配合，外人隔在千里之外真的不容易帮你判断。你必须提供的信息有：  

1. 操作系统及版本号（Mac, Windows 或者具体 Linux）  
2. 使用的开发语言环境及版本号（Node.js，Ruby, Python 等）。一般在你敲命令后面加 `--version`，`version` 或者 `-v` 都可以得到。
3. 涉及到的相关软件环境及版本号，比如什么浏览器或者数据库。
4. 重现的步骤，如果有的话。
5. 截图，**相关的**源代码，日志等。这个要求比较高，新手不容易判断什么是相关的，很容易全部一股脑都丢上去。这是没人愿意看的。如果你真的判断不出来，有几个办法：
  * 把所有的代码放在 https://github.com/ 上给别人去看。  
  * 在 https://gist.github.com/ 上按源码类别，创建临时链接。  
  * 如果是前端相关，可以把代码都放在 https://jsbin.com ，http://codepen.io ，https://jsfiddle.net 或者 http://runjs.cn/ 。

### 让别人更乐意看

1. 有礼貌，有礼貌，有礼貌。
2. 不要打紧急之类的字眼，没人有责任尽快帮你看。
3. 简明扼要。这里就考验你写作和表达能力了。
4. 贴上一些找过的资料，描述它们没法解决你的问题。可选，证明你有自己思考，不是伸手党。

## 追问

[5 Whys 原则]: https://en.wikipedia.org/wiki/5_Whys

前面说的都是如何像别人提问。这里是希望你能向自己提问，甚至追问。怎么追问呢？遵循著名的 [5 Whys 原则][]，能帮助我们无论从技术角度还是从业务角度，找到问题的根本原因。解决根本的问题。这个原则的创始人是 Sakichi Toyoda 并在 Toyota 里广泛推行的。其中拿来说明的例子是这样的：

1. 为什么我们的机器停了？电路过载了，导致保险丝熔断
2. 为什么电路过载？轴承的润滑油不够，锁死了
3. 为什么润滑油不够？因为机器的油泵出油不畅通
4. 为什么出油不畅通？油泵吸入口被金属屑堵住了
5. 为什么有金属屑？因为油泵没有过滤嘴

这样问下来，是不是就非常接近事情的根本原因了？

在编程开发里面的例子可能是这样的。

1. 为什么我们的网站突然那么慢？服务器内存占用率很高
2. 为什么服务器内存占用率那么高？因为新加的查询功能，没有在数据库加索引
3. 为什么没有加索引？xxx 是新人，没有经验
4. 为什么没有培训和 code review？我的错，没有时间
5. 为什么你没有时间？老是被你拉去开会（老板黑线脸）

开玩笑。其实，5 Whys 不一定非要问到第五个，或者可以问更多。最重要的是尽可能接近事情的根本原因，知道事后补救和解决方案以避免重复发生。从不同的角度去考虑和解决问题，包括短期和长期的方案。

## 总结

不管是问别人还是自己，如何提出恰当的问题是找到正确解决方案的关键。  