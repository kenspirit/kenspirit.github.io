title: 深入到骨子里的分布式和微服务化编程语言
date: 2018-09-19 08:30:38
tags:
  - Elixir
  - Distributed
  - MicroServices
categories:
  - Sword
---

[MicroservicePremium]: https://martinfowler.com/bliki/MicroservicePremium.html

分布式和微服务化，已经大行其道很久了。现在很多项目动不动就说做成微服务，不管不顾自己的项目性质，和相应的工具链支持。关于微服务，我还是很喜欢 Martin Fowler 大叔在 [MicroservicePremium][] 里说的：  

>my primary guideline would be **don't even consider microservices unless you have a system that's too complex to manage as a monolith.**  

微服务最基本，最核心的点是什么？服务切分。一个能很好切分服务的架构师，即便是让他用 Monolith 的方式搭建系统，模块的划分也应该是很清晰的。  

那么，假如你手上拥有的已经是 JAVA 界当前开发效率最高，开发约定最统一的 Springboot 实现的一个 Monolith 系统，如果要把它分隔为几个独立的服务，你觉得会有多简单？除了复制一些配置，切分新建几个 Application 这些体力活外，模块间的通信方式则可能需要有很大的改变。原来的 Java 代码调用，现在可能要改成 http 接口，grpc 等，即便不需要对外提供服务。  

在 Elixir 里，如果规划的好，模块的切分一开始就通过 GenServer 等使用消息传递的方式来调用，后期的微服务化简直就是拆一下文件目录就差不多了，并不需要再大费周章改接口，统一数据传输格式等。Elixir 的 Node 节点注册，Process 注册、管理和通信，为打造微服务化和分布式的系统提供非常好的支持。  

更难得的是，Elixir 坐拥了 Erlang 传承的宝藏，一篮子的工具库，让代码，服务间的调用和监控变得非常容易。这一套工具可以说是历经几十年产品线上磨练的官方套件，不必像其它语言那样到处搜罗组装开源工具，或者自研。  

比如，我现在只是实现一个计数器，你每次可以向它获取下一个可用的数字，它会一直自增下去。如果你不想每次自增的间隔是 1，那可以设置其它间隔。  

这么简单的一个应用，可以算是一个微服务了吧？我们还可以怎么把它切分为更细的服务吗？我们还可以把它分成三部分：  

1. 实现自增，和间隔设置逻辑的业务服务  
2. 保存数据状态的服务  
3. 监控这两个服务的 Supervisor 服务，假如业务逻辑出错，负责重启  

下面这幅图应该基本可以说明整个应用是如何运作的了。  

![Elixir Sequence Server Demo](http://thinkingincrowd.u.qiniudn.com/Elixir_Sequence_Server_Demo.png)  

你可以看到，如果我把自增的间隔故意设置为非数字，导致服务意外退出，背后的 Supervisor 服务会将它悄悄的重启，并按照编写好的逻辑，把 Server 的内部状态数据保存到数据服务，以便重启时读取。等我重新设置一个正确的数字自增间隔后，就可以接着获取新的号码了。  

在 Elixir 的交互控制台 iex 下，敲入 `:observer.start()` 这个命令，就可以监控整个系统的运行状态，包括有哪些 Application，哪些 Process，Application 内存使用情况，内部数据状态（State）等。  

![Elixir Sequence Server Hierchary](http://thinkingincrowd.u.qiniudn.com/Elixir_Sequence_Server_Hierarchy.png)  

![Elixir Sequence Server Info](http://thinkingincrowd.u.qiniudn.com/Elixir_Sequence_Server_Info.png)  

![Elixir Sequence Server State](http://thinkingincrowd.u.qiniudn.com/Elixir_Sequence_Server_State.png)  

总的来说，Elixir 的消息调用机制，Application 的组织方式，Process Supervision 和节点的架构方式，丰富的系统工具，真的是从骨子里散发出微服务的光芒。数据的 immutability 更是让分布式数据处理更安心，不用担心一些不必要的多线程问题。  

[Elixir in times of microservices]: http://blog.plataformatec.com.br/2015/06/elixir-in-times-of-microservices/  

Elixir 的作者 José Valim，在 [Elixir in times of microservices][] 这篇文章中介绍更清楚详细，推荐一读。  


相关文章：  

[初尝 Elixir，真的挺好喝的]: http://www.thinkingincrowd.me/2018/08/21/first-taste-on-elixir/  

[初尝 Elixir，真的挺好喝的][]
