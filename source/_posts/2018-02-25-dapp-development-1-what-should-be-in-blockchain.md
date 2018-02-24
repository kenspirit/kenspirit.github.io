title: Ethereum Dapp 开发 (1) - 什么应放在区块链上
date: 2018-02-25 07:55:24
tags:
  - Blockchain
  - Ethereum
  - Dapp
  - Smart Contract
  - IPFS
categories:
  - Sword
---

Ethereum Dapp (decentralized application) 是在区块链 Ethereum 公链上的分布式应用。  

[Secrete Note]: http://www.secret-note.one  

[介绍]: http://www.thinkingincrowd.me/2018/01/23/how-to-store-your-secret-in-ethereum-blockchain/  

前不久，我刚接触 Dapp 的开发，做了一个应用叫 [Secret Note][]（可查看此[介绍][]）。接下来，我希望通过几篇文章，来分享一下想法，和开发过程。  


## 区块链是否适合

不是什么东西都适合放在区块链上。它有自己的特性：  

1. 分布式存储，而且是不受某一主体控制  
2. 写入信息永不磨灭  

想想我们经常使用的网盘，或者一些提供笔记存储服务的系统，说是多大存储量，永不收费。然后，突然就说停止运营了。如果我们能利用区块链这两个特性保存数据，是不是就完全不一样了？  

所以，根据这两个特性，我做这个 Dapp 的意义就很明显：让大家可以保存信息在一个永不磨灭的地方，而且不受任何主体控制，也就不存在停止运营一说了。（当然，Ethereum 整个区块链技术被遗弃除外）


## 保存什么在链上

保存数据在公链上是有成本的。每对区块链公链作出更改，都要耗费一定的 Gas（矿工费）。而 Gas 是要用一定量的 Ether (ETH) 币来支付的。  

而且，对公链做越复杂的操作，需要的 Gas 越多，成本越高，甚至矿工也会拒绝执行你的操作。所以，做复杂的运算，和存储大量的数据在区块链里面也是不合适的。我们只能把最关键的数据，存放在区块链里面。  

回到我这个应用，我应该放什么数据在区块链上呢？  

用户要保存的资料，数据量肯定是比较大，无法直接存在链上的。而且区块链里面的数据，都是公开的，保存关键隐私数据要很小心处理，不然很容易泄漏。这样的话，我们应该保存在链上的是用户资料的索引，然后再根据索引去获取内容。  

[IPFS]: https://ipfs.io/

既然我们用区块链的目的是不希望依赖某一主体，那资料的内容当然也只能选择分布式存储的手段。[IPFS][] 正是分布式的互联网平台，并可以承担内容存储的角色。所以，用户的资料内容就选择保存在它上面。  


## 怎么保存到链上

在 Ethereum 公链上执行逻辑和存储，是通过智能合约（Smart Contract）来处理的。Ethereum 的官方定义也是：  

>Ethereum is a decentralized platform that runs smart contracts

[Solidity]: https://solidity.readthedocs.io/en/develop/  

所以，要开发 Dapp，我们首先要学习怎么开发定义一个 Smart Contract。开发 Smart Contract，需要我们使用一种新的语言 [Solidity][]，下一章我们就使用它来定义我们的合约。  

