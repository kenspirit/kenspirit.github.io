title: Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）
tags:
  - Blockchain
  - Ethereum
  - Dapp
  - Smart Contract
  - Truffle
  - Ganache
categories:
  - Sword
date: 2018-03-11 16:44:16
---


## Truffle 是什么？

[Truffle]: http://truffleframework.com/

上一篇文章我们已经介绍了如何使用 Remix 来初步测试智能合约。虽然它使用起来很方便，但是还是有一些不适合拿来当测试工具的地方。我们来尝试用另一个叫 [Truffle][] 的工具来测试。  

Truffle 是什么呢？它的官方介绍是这样的：  

>**YOUR ETHEREUM SWISS ARMY KNIFE**
>
>Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.

霸气吧？既然敢称自己为 Ethereum 的瑞士军刀，那它肯定不仅仅只能拿来当测试框架用。它其实是 Ethereum Dapp 的一套开发框架。后面的文章我们会再介绍如何使用它来开发，这篇文章暂时只关注如何使用它来测试智能合约。  

## 安装

Truffle 是完全基于 JavaScript 写的。它的安装非常容易。  

>npm install -g truffle

[Node.js]: https://nodejs.org/en/

npm 是 [Node.js][] 的包管理系统，这里我就不介绍了。大家自行到官网下载安装最新的 LTS 版本就可以了。  

[Ganache]: http://truffleframework.com/ganache/

另外，我们还要安装 [Ganache][]。这个工具可以很容易地帮我们配置一个本地的 Ethereum blockchain 节点，方便我们测试。这个工具的安装需要根据不同操作系统下载安装包，也非常简单。  


## 项目配置

必要的工具安装好以后，我们要配置一个 Truffle 使用的项目目录结构，和一点配置文件。  

[模板结构项目]: https://github.com/kenspirit/eth-dapp-base.git  

我建了一个 Ethereum Dapp 开发的[模板结构项目][]放在 Github 上，大家 clone 下来就可以了。里面还有一些前端相关的文件，这些在后面做 Dapp 前端交互的时候再关注，暂时可以不用理会。  

代码克隆下来后，大家先进入项目的文件夹内，运行以下命令，安装一些必要的包。  

>npm install

整个目录里面，我使用红色框标出和 Truffle 以及测试相关的部分。  

![Project Structure](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/eth-dapp-base-project-structure.png)  

1. `contracts` 目录下放的是智能合约文件。  
  那个特殊的 `Migrations.sql` 是 Truffle 拿来运行智能合约升级脚本，记录版本的合约。你无须理会。  

2. `migrations` 目录下，是按顺序要运行的智能合约脚本。  
  这就像你跑数据库升级脚本一样，增量式的。第一个是部署 truffle 那个 `Migrations` 合约，第二个就是部署我们自己的合约。  

3. `test` 目录下，存放智能合约的测试脚本。  
  Truffle 支持写 JavaScript 或者 Solidity 来测试智能合约。这次我只介绍怎么用 JavaScript 来测试。  

[官方文档]: http://truffleframework.com/docs/advanced/configuration

4. `truffle.js` 和 `truffle-config.js` 都是它的配置文件。  
  正常来说应该是放在 `truffle.js` 里面的。但是，在 Windows 环境下，`truffle.js` 可能会和 truffle 的命令产生冲突。[官方文档][]列了一些解决方案，重命名为 `truffle-config.js` 是其中一种。  


## 测试

在 `truffle.js` 里面，我们已经配置了连接的环境是本地的 blockchain。所以，在运行测试前，我们要先启动前面安装好的 Ganache。  

### 框架和基本规则

[Mocha]: https://mochajs.org/  
[Chai]: http://chaijs.com/  

如果你曾经写过 JavaScript 的测试，那你可能已经接触过 [Mocha][] 和 [Chai][]。Truffle 就是使用这两个工具来测试的。  

那 Truffle 的测试，和普通的 Mocha 能识别的测试有什么不同呢？  

[clean-room features]: http://truffleframework.com/docs/getting_started/testing#clean-room-environment  

1. Truffle 里面使用的是 `contract` 关键字，而不是 `describe` 关键字。  

2. Truffle 为 `contract` function 代码块提供了 [clean-room features][]。  
  意思就是，在每个 `contract` 函数运行前，你的合约都会重新部署。那么，在 `contract` function 里面的所有测试都运行在干净的合约状态之下。（`contract` 里面的代码都共享一个合约状态，下面会解释）

3. `contract` 方法提供了一些测试帐号，方便测试使用。  


### 语法和编写

[官网]: http://truffleframework.com/docs/getting_started/javascript-tests  

Truffle 支持 `async/await` 和 `then` 的 Promise 写法。因为前者比较节省篇幅，本文就只介绍 `async/await` 的写法。如果你还看不惯 `async/await` 的语法，Truffle 还支持 `then` 的写法，详细的例子大家可以看看[官网][]。  

测试文件的整体结构是这样的。  

一开始我们需要使用 `artifacts.require('SecretNote')` 来获得某个特定合约的抽象类，从而可以操作这个智能合约。  

```javascript
const SecretNote = artifacts.require('SecretNote');

contract('SecretNote async/await style full test', async (accounts) => {
  // `it` 测试代码块在这
});
```

假定我们的第一个测试用例是判定合约最开始的笔记数量是否为 0，那么，相应的 `it` 测试代码块可以这样写：  

```javascript
  it('Initial Note Count should be 0', async () => {
    const instance = await SecretNote.deployed();
    const initalCount = await instance.getTotalNoteCount();

    // initalCount is BigNumber object
    assert.equal(initalCount.valueOf(), 0);
  });
```

[BigNumber]: https://github.com/MikeMcl/bignumber.js

这里有两点要注意的：  

1. `await SecretNote.deployed()` 部署和获取一个合约实例。这段代码，只要在一个 `contract` function 里面调用，无论多少次，获得的合约实例都是同一个。  

2. `instance.getTotalNoteCount()` 获取的数据，都是被包装成 [BigNumber][] 对象的，因为 JavaScript 处理不了大额数字，和浮点数据。  

剩下来我们可以写另外两个测试了：  

```javascript
  it('Set and get Note', async () => {
    const instance = await SecretNote.deployed();
    const noteKey = 'key';
    const originNoteValue = 'value';

    await instance.setNote(noteKey, originNoteValue)
    const noteValue = await instance.getNote(noteKey);
    // Github issue: https://github.com/ethereum/web3.js/issues/337
    assert.equal(web3.toAscii(noteValue).replace(/\u0000/g, ''), originNoteValue);
  });

  it('Note Count is Correct After Setting Note', async () => {
    const instance = await SecretNote.deployed();
    const initalCount = await instance.getTotalNoteCount();

    assert.equal(initalCount.valueOf(), 1);
  });
```

这里也有两点要注意的：  

[web3.js]: https://github.com/ethereum/web3.js  

1. `web3` 是自动注入的 [web3.js][] 实例，它是 Ethereum 兼容的 JavaScript API 库。  

2. `toAscii` 在 web3.js 0.1x 版本有数据转换的问题。在 1.0 版本后，会有另外适合人看的转换 API。  

我们测试的最后一个场景是，非合约创建者（Ownable），不能调用 `getTotalNoteCount` 接口获取到数据：  

```javascript
  it('Exception should throw if not owner call getTotalNoteCount', async () => {
    // accounts[1] 是合约部署地址
    const notOwnerAccount = accounts[2];

    const instance = await SecretNote.deployed();

    try {
      const initalCount = await instance.getTotalNoteCount.call({ from: notOwnerAccount });
    } catch (e) {
      // Chai BDD style.  From truffle v4.0.7
      expect(e, 'I know it').to.exist;
    }
  });
```

[智能合约交互]: http://truffleframework.com/docs/getting_started/contracts  

有需要的话，我们在 Truffle 测试脚本里，还可以用另一种方式和[智能合约交互][]：  

>const contract = await SecretNote.at('0x123456...');

'0x123456...' 只是示例，它实际上应该放你的智能合约地址。  

那我们怎么在本地编译部署智能合约，和获取它的地址呢？  


## 编译部署合约

Ganache 启动后是这个样子的，默认已经准备好了一些测试帐号。  

![Ganache Startup](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/ganache-startup.png)  

然后，我们在命令行依次运行 `truffle compile` 和 `truffle migrate` 命令。运行 `truffle migrate` 前，要确保你在 `truffle.js` 配置的 Ethereum 节点已经起来了。当前的配置，就是你的 Ganache。  

![Truffle Compile Migrate](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/truffle-compile-migrate.png)  

运行完后，你可以再去看 Ganache 里面的第一个账户余额已经不是 100 ETH 了，因为扣除了一部分 Gas 来建立智能合约。点击 Transactions 那个按钮，也可以看到刚才部署智能合约产生的交易记录。  

![Ganache Account](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/ganache-account.png)  

![Ganache Transactions](https://raw.githubusercontent.com/kenspirit/blog-cdn-data/master/ganache-trx.png)  

到这里，你的智能合约已经在本地的 Ethereum blockchain 节点部署完成了。部署到测试环境或者正式 Ethereum 公链的方法，我们后面再介绍。  


## 相关阅读

[Ethereum Dapp 开发 (1) - 什么应放在区块链上]: http://www.thinkingincrowd.me/2018/02/25/dapp-development-1-what-should-be-in-blockchain/  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约]: http://www.thinkingincrowd.me/2018/02/27/dapp-development-2-contract-development-in-solidity/  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）]: http://www.thinkingincrowd.me/2018/03/05/dapp-development-3-contract-testing-remix-ide/  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）]: http://www.thinkingincrowd.me/2018/03/11/dapp-development-4-contract-testing-truffle/  
[Ethereum Dapp 开发 (5) - 页面开发集成]: http://www.thinkingincrowd.me/2018/03/17/dapp-development-5-UI-integration/  

[Ethereum Dapp 开发 (1) - 什么应放在区块链上][]  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约][]  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）][]  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）][]  
[Ethereum Dapp 开发 (5) - 页面开发集成][]  
