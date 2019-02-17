---
layout: post
title: "读 Lean Startup 和观电影 Lincoln，电影 The VOW 后感"
date: 2013-02-13 21:40
comments: true
categories: 
- Think
tags:
- Change
- Destiny
---

这篇 Blog 内容有点杂，是因为这是过年期间做的主要几件事情，几篇 Blog 又太多，况且只是那么些胡思乱想，加上里面确实有些相通的地方，所以还是合体吧。  

[Lean Startup]: http://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898

##[Lean Startup][]##
这本书我总体来说看的比较粗略，主要因为前面的章节在目前身处非创业型企业文化下不太容易适用得上，所以目的只是大概了解作者思想。后面的 _Part Three ACCELERATE_ 部分倒是有些是可以相对容易地应用在成熟，或者说已经某程度上固化并寻求改变的企业上。我说的是不太容易和相对容易，因为任何改变，重则涉及文化，轻亦涉及利益，都是难事。那如何建立一个 Adaptive 的企业环境呢？  

###突破点###
Five Whys 是在第11章 _Adapt_ 里提到的一个很好的方法。其实就是中国人说的打破砂盆问到底。看来还是古人智慧无穷啊。这个 Five Whys 除了带来它显而易见的好处，也就是了解到事件的根源之外，其实还可以让一个企业或团队控制解决问题的程度和节奏。问五次，不至于太少而了解不到真相，也不至于太多，而浪费过多精力。  

我们很常在开发或团队建设中碰到不少问题，比如说每次代码改动后要浪费很长时间部署，某某人改动代码后部署不成功了，新人不了解系统框架，部分人写代码很不好读等。很多人听到这些问题都会抛出一个大而全的答案，机器慢，没 CI 环境，没培训，没标准等。这种答案因为太笼统和没有边际，导致解决方案看起来需要大量人力物力去解决问题，后来不了了之，说了白说。  

所以，Five Whys 的实施要求是 **Be Small，Be Specific**。  

比如前面说代码改动后部署慢，原因可能是要重新编译打包和 Web 容器启动慢。那为什么要重新编译打包，可能是因为某些系统服务编译和打包的脚本绑定在一起。那可不可以把它们分开？如何分开？能否借助工具做 Hot Deploy？那为什么容器启动慢？能否不用 EAR 来部署，减少解压缩时间？能否换用轻量级容器？能否禁用不必要插件？ 这些其实就是一些细小而精确的建议和想法。再比如书本举出的很常见的例子，就是培训。多少的培训才足够，覆盖范围要多广？还是说，在碰到问题后，才写出对应的 Guideline 来避免错误再次发生？这样的 Incremental 式的累积，会否更省时间，更有效针对问题？  

其实 Be Small，Be Specific 还有另一个好处就是避免由 Five Whys 而产生出 Five Blames。把问题精确化，细化，可以尽量避免问题扩大化，责任推诿，相互指责，无法确定责任人，最后无法解决。  

###实施细节###
另两条原则呢，可以引用原话来说：  
> 1. Be tolerant of all mistakes the first time.  
> 2. Never allow the same mistake to be make twice.  

还有一些比如说，不要带上历史包袱，把历史遗留问题等到重新出现时再解决；讨论问题原因和解决方案时，一定要所有牵扯到的人员在场，无论位处任何部门，级别等都是需要注意的事项，推荐各位去细看。  

###后台要硬###
这里可能说的有点黑，但其实中国人很能理解它的含义。因为要想做事，首先必须得到领导支持。要有开明的文化和环境，必须要有开明的领导。所以，充分让领导认识到 Five Whys 的好处，实施的原则，可能带来的后果和对团队文化的冲突，并取得全力支持，才能确保有效执行。  

[电影 Lincoln]: http://www.imdb.com/title/tt0443272/
##[电影 Lincoln][]##
Lincoln 每次说话，要么风趣睿智，要么充满激情。那一字一顿，不紧不慢而又坚定的语气，让我感受到这位历史伟人，对解放奴隶制的理想是多么执着。从以下欧几里德定理都可以看到人人生而平等，真是可贵，或者还是只能说他对此执着到何等程度。  

>It is a self evident truth that things which are equal to the same thing are equal to each other.

电影里也描述了他作为一位父亲和丈夫的一面，那些为国而牺牲家庭对他带来的愧疚。总体来说，这是一部不错的电影，让我看到当中的一些人性转变，慷慨激昂，推荐大家看看。  

###懂得如何前行###
电影里的一段他对 Mr. Steven 说的话，我觉得深有感触。听写可能有差别，但大意应该没错：  
>A compass, I learnt when I was surfing in hill, will point you to the true north where you are standing, but it has got no advice about the swamps, deserts, chasms, along the way.  You can pursuit to go the destination, you plunge your head ahead, heedlessly of the obstacles, achieving nothing more than sinking in the swamp?  What is the use of knowing the true north?

其实这里说的道理就是，即使你知道真理和正确的方向，如果因为鲁莽地直行，被途中困难所牵绊而无法到达目的地，那手握真理意义何在？  

正如去年我的目标是 Drive the Change，如果说我只顾四处宣扬，不顾各方抵触，而不是实在的迂回实施，那意义何在？ 所以说，求变，也要懂得如何带领别人跟随而变。自己独变，往往成为异类，无法生存。带领众变，才能成为改变历史的潮流。  

[电影 The VOW]: http://www.imdb.com/title/tt1606389
##[电影 The VOW][]##
这可能算是老套的爱情桥段电影了。女主角撞车失忆，她丈夫尽一切办法想她恢复，但都无能为力。放手离开后，女主角重过生活，发现后来，还是沿旧轨迹，邂逅男主角，重续前缘。  

老婆看的纸巾浪费无数，我也被男主角的无私的爱而折服。情爱的观点基本共通，我也就不说了。此外的感悟是，一个人，即使让你重新走一次走过的路，可能你还是会沿旧有的轨迹再走一次。你就是你，无论何时何刻，那一刻的反应，那一刻的抉择，都是你内心的反映。所以，不必后悔说，如果回到某时某刻，可能你就不会那样做了。也不用对一些事情犹豫不决，不知道做了学了，对日后是否有益处。要做的，还是跟随自己的心，在当前时刻，做一个自己的决定，走自己的路。最终回首，一些看不起眼的决定，都是为你的 Destiny 而铺设的。正如乔帮主的名言，过去不起眼的点，在最后都会连成线，成就你自己。

>Again, you can't connect the dots looking forward; you can only connect them looking backwards. So you have to trust that the dots will somehow connect in your future. You have to trust in something - your gut, destiny, life, karma, whatever. This approach has never let me down, and it has made all the difference in my life.

所以说，自己认为该做的就去做，该放手时，还是应该放手。是你的，总会回来。不是你的，放手后，可能你的才会来。谋事在人，成事在天。Make things happen，but don't force things happen。  


