title: Ethereum Dapp 开发 (5) - 页面开发集成
date: 2018-03-17 13:40:40
tags:
  - Blockchain
  - Ethereum
  - Dapp
  - Smart Contract
  - MetaMask
categories:
  - Sword
---


本篇文章主要讲述 Dapp 前端页面，怎么和 Ethereum 帐号网络集成。不过，涉及的前端开发和代码，不会包括在覆盖范围内。因为前端开发框架太多（Vuejs, React, AngularJS，JQuery 等），使用什么都可以，所以本文仅解释合约相关的代码。本文代码以 Vuejs 代码为样例，也在 Github 上。  

本教程，也就是简化版的 Secret Note 页面如下图。页面的最上方，显示的是当前连接的 Ethereum 网络，Gas 价格，和登录的 Ethereum 帐号地址。  

![Simple Secret Note UI](http://thinkingincrowd.u.qiniudn.com/simple-secret-note-ui.png)  


## Web3

[web3.js]: https://github.com/ethereum/web3.js  

想要在页面集成 Ethereum 帐号网络，并且对智能合约进行操作，我们需要借助前一章提及的 [web3.js][]，它是 Ethereum 兼容的 JavaScript API 库。  

在页面打开初始化的时候，我们需要初始化一个 Web3 的实例。这段代码放在 Vuejs 的 `created` 事件里。  

```javascript
  created() {
    if (typeof web3 !== 'undefined') {
      // Use MetaMask's provider
      web3js = new Web3(web3.currentProvider);
    } else {
      this.showAlertMsg('Please install <a href="https://metamask.io/" target="__blank">MetaMask</a> extension for your browser before using.', 'warning', 0);
      return;
    }

    // Async
    this.detectNetwork();
    this.getGasPrice();
    this.initAccount();
  },
```

当它检测到 `web3` 这个对象已经存在的时候，就根据当前 web3 的提供者（currentProvider），新建一个 Web3 的实例。只有当 Web3 实例初始化成功的情况下，我们才会继续检测当前的 Ethereum 网络，获取 Gas 价格，以及当前登录的帐号信息。  

[MetaMask]: https://metamask.io/

那谁会提供 web3 对象呢？就是代码里提醒安装的 MetaMask。[MetaMask][] 是一个浏览器插件，你可以使用它来生成新的 Ethereum 地址帐号，或者登录你现有的帐号。  


## 网络和帐号的初始化

在 Ethereum 世界，Eth 地址，就是身份帐号。所以，Dapp 和 Ethereum 的集成，我们应该只需要用户使用它们特定的帐号登陆就可以了，完全没有必要再额外弄用户名密码什么的。集成和使用一个广泛接受的帐号管理工具，能让你的 Dapp 用户更放心。  

### 代码集成

帐号初始化的代码，就在 `initAccount` 这个方法里面：  

```javascript
  initAccount() {
    function _getAccount() {
      const that = this;

      web3js.eth.getAccounts(function(err, result) {
        if (err) {
          return;
        }

        if (result.length === 0 || result[0] === that.account) {
          return;
        }

        that.account = result[0];
      });
    }

    setInterval(_getAccount.bind(this), 100);
  }
```

这里比较特别的是，设置了一个定时器，每隔 100ms 就会检测当前的帐号是什么，然后更新页面的帐号信息。
  

如果你看了 `detectNetwork` 和 `getGasPrice` 里面的代码，可能会疑惑，为什么它们不需要设定定时器呢？因为，MetaMask 插件检测到你切换网络，并且当前页面曾经访问和使用过 web3 对象的话，它会自动刷新页面。  

### MetaMask 配置

#### 本地网络设置

因为我们当前是使用本地的 Ganache 网络来测试，所以我们先要在 MetaMask 上面配置好网络和相应的测试帐号。  

首先我们点击左上角的网络下拉选择器，然后点击 `Custom RPC`：  

![MetaMask Custom RPC Menu](http://thinkingincrowd.u.qiniudn.com/metamask-custom-rpc-menu.png)  

然后我们在 Current RPC 下面输入 `http://localhost:7545`，点击 `Save`。  

![MetaMask Custom RPC Setup](http://thinkingincrowd.u.qiniudn.com/metamask-custom-rpc-setup.png)  

#### 帐号设置

安装完 MetaMask 插件时，它默认会帮你创建了一个新帐号。但是，我们需要把 Ganache 自动生成的帐号导入 MetaMask，才能使用它们和我们部署的合约交互。  

在 Ganache 首页的帐号列表下，我们选择第一个（合约创建帐号），点击最右边的钥匙图标，查看它的私钥，并且复制下来。（这里是测试帐号，所以暴露私钥没关系。但是如果是你的真实 Ethereum 帐号，就一定不能暴露了）  


![Ganache Account Show Key](http://thinkingincrowd.u.qiniudn.com/ganache-account-show-key.png)  

![Ganache Account Private Key](http://thinkingincrowd.u.qiniudn.com/ganache-account-private-key.png)  

然后，我们点击 MetaMask 页面右上角的小人图标，会出来以下菜单：  

![Metamask Account](http://thinkingincrowd.u.qiniudn.com/metamask-account.png)  

最后，点击 `Import Account` 菜单，就进入以下输入私钥的页面。然后粘贴刚才复制的私钥，点击 `Import` 即可。  

![Metamask Account Import](http://thinkingincrowd.u.qiniudn.com/metamask-account-import.png)  


## 智能合约的引入和交互

既然 Ethereum 测试帐号和网络的集成已经准备好，我们就可以在代码引入智能合约，并与之交互了。  

### 引入

首先，我们要先在当前项目下安装和使用 `truffle-contract` 这个包。  

>npm install truffle-contract

然后，在页面里 JavaScript 脚本的顶部，加入以下几行代码，引入上一章我们运行 `truffle compile` 后生成的合约 json。并且，配置好我们运行 `truffle migrate` 后部署在 Ganache 里面的合约地址。  

```javascript
import Contract from 'truffle-contract';
import SecretNoteDef from '../build/contracts/SecretNote.json';

const SecretNote = Contract(SecretNoteDef);
const CONTRACT_ADDRESS = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';
```

最后，在 Vue 组件的 `created` 事件里，等 web3js 初始化成功后，设置合约的 Ethereum 网络地址。  

```javascript
SecretNote.setProvider(web3.currentProvider);
```

### 交互

和智能合约的交互分两种：  

1. Transaction  

  Transaction 类型的交互是会永久改变 Ethereum 网络的状态，也就是涉及账户之间的转账，或者智能合约的数据的改变。这种交互是需要花费 Gas 的，而且交易需要确认，并不能马上返回。所以，这些交互需要绑定在某一个账户下来执行。SecretNote `setNote` 方法的调用就属于这种类型。  

2. Call  

  Call 类型的交互只是从区块链中读取数据。所以，它是不需要消耗任何 Gas 的，而且也能马上获取返回值。SecretNote `getNote` 方法的调用则属于此类型。  

#### Transaction 调用

1. 调用 `SecretNote.at()` 方法从特定地址获取合约实例。  
2. 在获取的实例对象上，像调用普通 JavaScript 方法一样使用。特别之处是要指定调用的帐号地址。  

```javascript
    saveNote() {
      const that = this;

      SecretNote.at(CONTRACT_ADDRESS)
        .then((instance) => {
          return instance.setNote(that.noteForm.noteName,
            that.noteForm.noteContent, { from: that.account });
        });
    },
```

执行成功后，会弹出如下页面：  

![Metamask Trx Request](http://thinkingincrowd.u.qiniudn.com/metamask-trx-request.png)  

点击 `Submit` 后，交易记录会出现在账户下并等待区块链的确认。  

![Metamask Trx Confirm](http://thinkingincrowd.u.qiniudn.com/metamask-trx-confirm.png)  

#### Call 调用

SecretNote `getNote` 方法调用其实和 `setNote` 差不多，只是不需要指定帐号而已。  

有一点要注意的是，这个方法定义的返回值类型是 `bytes32`，所以要使用 `toAscii` 方法把内容转换后才使用。  

```javascript
    loadNote() {
      const that = this;

      SecretNote.at(CONTRACT_ADDRESS)
        .then((instance) => {
          return instance.getNote(that.noteForm.noteName);
        })
        .then((noteContent) => {
          if (!noteContent) {
            return;
          }
          that.noteForm.noteContent = web3js.toAscii(noteContent);
        });
    },
```

由于我们现在是在本地 Ganache 测试网络上集成和调试的，而 Ganache 每次重启后，数据都被重置，在 Solidity 合约代码还不稳定，需要经常改的时候，这是一个好事。但是，如果合约代码已经稳定，我们要调试前端代码，就不需要合约经常变了。下一章我们再看看如何把合约部署到 Ethereum 的一些公共的测试网络吧。  


## 相关阅读

[Ethereum Dapp 开发 (1) - 什么应放在区块链上]: http://www.thinkingincrowd.me/2018/02/25/dapp-development-1-what-should-be-in-blockchain/  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约]: http://www.thinkingincrowd.me/2018/02/27/dapp-development-2-contract-development-in-solidity/  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）]: http://www.thinkingincrowd.me/2018/03/05/dapp-development-3-contract-testing-remix-ide/  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）]: http://www.thinkingincrowd.me/2018/03/11/dapp-development-4-contract-testing-truffle/  
[Ethereum Dapp 开发 (5) - 页面开发集成]: http://www.thinkingincrowd.me/2018/03/17/dapp-development-5-UI-integration.md/  

[Ethereum Dapp 开发 (1) - 什么应放在区块链上][]  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约][]  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）][]  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）][]  
[Ethereum Dapp 开发 (5) - 页面开发集成][]  
