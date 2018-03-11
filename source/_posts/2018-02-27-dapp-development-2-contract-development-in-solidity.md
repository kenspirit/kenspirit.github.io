title: Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约
date: 2018-02-27 20:20:20
tags:
  - Blockchain
  - Ethereum
  - Dapp
  - Smart Contract
  - Solidity
categories:
  - Sword
---

[Secret Note]: http://www.secret-note.one  

Ethereum 的 Dapp 开发，保存数据在公链上，最基本的就是要实现一个智能合约。我们先来看一下 [Secret Note][] 的智能合约怎么实现。  


## Solidity 简介

>Solidity is a **contract-oriented**, high-level language for implementing smart contracts. It was influenced by C++, Python and JavaScript and is designed to target the Ethereum Virtual Machine (EVM).  
>  
>Solidity is **statically typed, supports inheritance**, libraries and complex user-defined types among other features.

我高亮了几点我们在这次开发上需要用到的特性。  

学习过其它高级编程语言的开发可能对这些名词已经比较熟悉了。什么是 **contract-oriented** 啊？这好像是新玩意啊。其实你想想 JAVA 的 **class-oriented** 基本就能猜出七七八八了。


## 合约编写

早在 2012 年，我在自己的一篇关于 JavaScript 测试的文章提到一个理念：需要测试的，是双方之间协定的合约。这个合约就是交互的接口和行为。  

这个理念放到智能合约的编写上，我感觉更加直接了。所以，我们需要怎么编写智能合约，最重要的是想清楚，今后这个合约和外界交互的行为是什么。  

### 与普通后端开发最大区别

智能合约的开发，不像普通后端的开发，有 bug 或者想加功能了，重新发一版就好了。  

**智能合约发布出去，就没法修改了。**  

所以，把智能合约发布上公链前，一定要想清楚需求，做好测试。如果合约的链上行为，业务上真的很可能需要升级和修改，就应该提前想好策略，比如隔离接口和业务逻辑合约，使用类似 proxy 的设计等。这属于比较高级的开发需求，我也还不是了解的很清楚，这篇教程暂时不涉及这方面的内容。  

### Secret Note 合约设计编写

对于 Secret Note 这个 Dapp 来说，它对外提供的行为，智能合约的接口应该有什么呢？  

1. 保存资料的索引  
2. 获取资料的索引  

最核心的功能，好像就这两个了，是吧？按照这个简单的设计，合约的代码大致是这样的。  

```solidity
pragma solidity ^0.4.18;

contract SecretNote {
  mapping(address => mapping(bytes32 => bytes32)) notes;

  event SecretNoteUpdated(address indexed _sender, bytes32 indexed _noteKey, bool _success);

  function SecretNote() public {
  }

  function () public payable {
  }

  /**
   * @dev For user to get their own secret note
   * @param _noteKey The key identifier for particular note
   */
  function getNote(bytes32 _noteKey) public view returns (bytes32) {
      return notes[msg.sender][_noteKey];
  }

  /**
   * @dev For user to update their own secret note
   * @param _noteKey The key identifier for particular note
   * @param _content The note path hash
   */
  function setNote(bytes32 _noteKey, bytes32 _content) public payable {
      require(_noteKey != "");
      require(_content != "");

      notes[msg.sender][_noteKey] = _content;

      SecretNoteUpdated(msg.sender, _noteKey, true);
  }
}
```

#### 基本信息

代码文件最开始的一行，`pragma solidity ^0.4.18;`，标记了代码应该由什么版本的编译器编译，以避免在不同环境出现问题。  

智能合约，是通过 **contract** 关键字，和它的名字来定义的。合约的主体内容在最外层的 `{` and `}` 之间。  

#### 数据类型

Solidity 作为一种高级的静态类型编程语言，当然也有自己支持的数据类型。在这个合约里面，我们用了三种：  

* address  

这种类型可以保存一个 Ethereum 地址。比较特殊的是，它还有自己的成员属性和方法。最常见的是 `balance` 属性和 `transfer` 方法。  

* bytes32  

Solidity 里面有分定长和变长的 byte 数组。  

定长的有 `bytes1`, `bytes2`, `bytes3`, …, `bytes32`. `byte` 是 bytes1 的别名。它们都有只读属性 `length`。  

变长的有 `bytes` 和 `string`。  

`string` 是用来保存不定长 UTF-8 字符数据的。其它的都是 byte 数组。如果可以，尽量用定长的可以节省资源，减少 Gas 的使用等。  

* mapping  

我们可以把 `mapping` 当作一个哈希表。这个哈希表的 key 几乎可以是任何类型，除了 `mapping`，变长 byte 数组，contract，enum 和 struct 结构体。哈希表的 value 就可以是任何类型的数据。  

`mapping` 有个很特殊的地方就是它没有长度，你也无法检查一个 key 是否在它里面。因为它是虚拟地记录了每一个可能的 key，对应值为全 0 字节，也就是任何数据类型的默认值。  

[iterable mapping]: https://github.com/ethereum/dapp-bin/blob/master/library/iterable_mapping.sol  

`mapping` 也无法遍历。所以，我们只能通过一种绕一些的方式来遍历它。可以参看官网的 [iterable mapping][] 例子，或我的 Secret Note 源码。  

[源码]: https://github.com/kenspirit/secret-note  

_复杂的用户定义类型：在这篇文章就不介绍了，有兴趣的朋友可以直接看 Secret Note 的[源码][]_

#### 关键字

Solidity 有 4 种作用域修饰符。`public` 是合约的接口，可内部或通过外部消息调用。`external` 也是合约接口，但是不能内部调用。`internal` 只能内部，或者由继承的合约调用。`private` 只能在定义的合约内可调用，但是，它不代表区块链外不可见。  

`view` 修饰符表示这个方法承诺不会修改合约的状态。`constant` 是它的别名。不过，虽然这么说，编译器是没有检查，或者强制限制这个方法不能改变合约状态的。  

`payable` 修饰符用来标记某个方法可以同时接收发过来的 Ether。  

`msg.sender` 特指调用此方法的 Ethereum 地址。`msg` 还有其它全局属性，详情可查看 Solidity 文档。  

`require()` 就像其它语言的 `assert` 那样检查前置条件。不满足的话，会抛错。它通常用于检查外部输入等有效条件。另一个类似用法的 `assert` 则用户内部错误的检查。  

#### Fallback 方法

```
  function () public payable {
  }
```

这个没有任何名字的是 `Fallback` 方法。一个合约只能存在一个。这个方法没有参数，也没有任何返回值。如果有人调用这个合约，但是指定的方法找不到，它会被触发。  

还有，当这个合约地址单纯地收到 Ether 的时候（比如他人转账到这个合约地址），这个方法也会被调用。所以，它必须被标记为 `payable`。不然，这个合约地址就没法通过普通的交易接收 Ether 了。  

要注意的是，如果这个方法里面有逻辑，一定要确保它的 Gas 消耗要小于 2300。  

#### Event

事件是 EVM 日志记录的使用方式。如果你在你开发的 Dapp 里监听了某一个事件，当这个时间被触发后，你在 Dapp 设的监听器就会收到通知。  

事件的数据是存储在交易日志里的。它们可以被检索，但是合约代码里面没法访问它们。  

每个事件最多有 3 个索引的（`indexed`）参数，我们可以根据这些参数进行过滤检索。非索引的参数存在记录日志的数据部分里，但是索引的参数是没有存的。你只能用某个值去查索引，但是没法罗列有哪些值。  

#### 继承

上面两个合约方法是公开的，每个人都可以调用。那如果我想添加一些只有合约创建者才能调用的方法呢？假如，我想让只有创建者能查这个合约里面存了多少资料呢？  

我们可以利用继承和修饰符来实现上面的目的。  

首先，我们定义一个父合约 `Ownable`，这个合约在它的构造函数（constructor）里面把合约创建者保存到一个合约变量。然后，提供一个特殊的修饰符给子合约使用。  

```
contract Ownable {
    address owner;

    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
}
```

原来的智能合约，作为子合约，稍微修改一下就可以了。  

```
contract SecretNote is Ownable {
  uint256 noteCount;

  // 省略部分合约代码

  function setNote(bytes32 _noteKey, bytes32 _content) public payable {
      require(_noteKey != "");
      require(_content != "");

      notes[msg.sender][_noteKey] = _content;
      noteCount++;

      SecretNoteUpdated(msg.sender, _noteKey, true);
  }

  function getTotalNoteCount() public view onlyOwner returns(uint256) {
      return noteCount;
  }
}
```

我们只需要吧 `onlyOwner` 这个修饰符添加到任何希望只有合约 owner 才能执行的 function 签名处，这个 function 就拥有检查调用者的能力了。加了 `onlyOwner` 的 function，其实就是把代码替换到 `_` 的位置。  

## 安全方面的考量

因为合约一旦部署，就无法修改，而且很多的智能合约都和加密货币或者 token 挂钩。所以，如果一个智能合约的实现出现了安全漏洞，就有可能引起很大的问题。  

[文档]: https://solidity.readthedocs.io/en/develop/security-considerations.html  

Solidity [文档][] 里有专门的一章写了一些推荐做法，大家应该至少看 **Use the Checks-Effects-Interactions Pattern** 和 **Include a Fail-Safe Mode** 两点。  


到这里为止，我们就把简化版 Secret Note 的智能合约写好了。下一篇我们来看看如何测试它。  


## 相关阅读

[Ethereum Dapp 开发 (1) - 什么应放在区块链上]: http://www.thinkingincrowd.me/2018/02/25/dapp-development-1-what-should-be-in-blockchain/  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约]: http://www.thinkingincrowd.me/2018/02/27/dapp-development-2-contract-development-in-solidity/  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）]: http://www.thinkingincrowd.me/2018/03/05/dapp-development-3-contract-testing-remix-ide/  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）]: http://www.thinkingincrowd.me/2018/03/11/dapp-development-4-contract-testing-truffle/  

[Ethereum Dapp 开发 (1) - 什么应放在区块链上][]  
[Ethereum Dapp 开发 (2) - 用 Solidity 开发智能合约][]  
[Ethereum Dapp 开发 (3) - 智能合约测试（Remix IDE）][]  
[Ethereum Dapp 开发 (4) - 智能合约测试（Truffle）][]  
