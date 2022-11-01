# ZJU-blockchain-course-2022

作业提交方式为：提交视频文件和仓库的连接到指定邮箱。

## 如何运行

1. 在本地启动ganache应用。

2. 在 `./contracts` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```
3. 在 `./contracts` 中编译合约，运行如下的命令：
    ```bash
    npx hardhat compile
    ```
4. 将合约部署到
5. ...
6. 在 `./frontend` 中启动前端程序，运行如下的命令：
    ```bash
    npm run start
    ```

## 功能实现分析

简单描述：项目完成了要求的哪些功能？每个功能具体是如何实现的？

建议分点列出。

### ERC20发币

实现了一个`StuERC20`合约，在页面上设置一个`加入社团`的按钮，学生点击`加入社团`前端调用`airdrop`函数，向学生发币。

```solidity
//StuERC20.sol
function airdrop() external {
        require(
            claimedAirdropPlayerList[msg.sender] == false,
            "This user has claimed airdrop already"
        );
        _mint(msg.sender, 10000);
        claimedAirdropPlayerList[msg.sender] = true; //将该学生的地址设置为已经加入社团
    }
```

```javascript
//前端调用后端函数
try {
        await stuERC20Contract.methods.airdrop().send({
          from: account,
        });
        alert('You have joined the club and obtained club token.');
      } catch (error: any) {
        alert(error.message);
      }
```



### 学生发起提案

在合约`StudentSocietyDAO`中定义了`proposal`结构体。

```solidity
struct Proposal {
        uint32 index; // index of this proposal
        address proposer; // who make this proposal
        uint256 startTime; // proposal start time
        uint256 endTime; // proposal 结束时间
        string name; // proposal name
        uint32 vote; // 支持票 vote+1, 反对票 vote-1
        bool isAwarded; // 是否已经发放奖励
        // TODO add any  if you want
    }
```

该结构体记录提案的下标、发起者、结束时间、名字、获取的投票、是否已经对学生发放奖励这些信息。

并且定义一个`proposal`数组

```solidity
Proposal[] public proposals; 
```

然后定义一个`propose`函数，来进行合约投票的操作。

```solidity
 function propose(string memory name, uint256 duration) public {
        // 1. create a new proposal
        // duration的单位是秒
        require(msg.sender.balance >= 2, "no enough money");
        uint256 etime;
        uint256 stime = block.timestamp;
        etime = stime + duration;
        // 把提案加入到队列中
        proposals.push(
            Proposal(
                uint32(proposals.length),
                msg.sender,
                stime,
                etime,
                name,
                0,
                false
            )
        );
        emit ProposalInitiated(uint32(proposals.length));
        //收取两个token
        studentERC20.transferFrom(msg.sender, address(this), 2);
    }
```

前端调用`propose`函数，向其中传入`propose`的名称和持续时间。其中用户界面的时间单位为小时，需要在前端进行转化为秒再传入函数。

而且因为`transferFrom`是委托转账，需要先`approve`。用户调用`StuERC20`的approve函数，`approve` `StudentSocietyDAO`合约，允许其帮自己转账1000.之后在`propose`函数中的`transferFrom`，将token转给`StudentSocietyDAO`。

```solidity
 try {
        await stuERC20Contract.methods.approve(proposeContract.options.address, 1000).send({
          from: account,
        });
        // 将提案提交到合约
        let h: number;
        // 把time乘3600转化成秒 
        h = values.time * 3600;
        console.log('time', h);
        await proposeContract.methods.propose(values.name, h).send({
          from: account,
        });

        const sa = await proposeContract.methods.getPropoNum().call();
        setPropoNum(sa); //设置合约的数目
        alert('成功发起提案');
      } catch (error: any) {
        alert(error.message);
      }
```



### 学生投票

在`StudentSocietyDAO`合约中实现`Vote`函数，传入变量为表示合约下标的`index`和表示是否赞成的`opin`。如果当前在提案的时间范围内，而且投票者有足够的`token`，那么则对对应的提案进行投票，并且使用`transferFrom`函数收取一个`token`.

```solidity
 function Vote(uint32 index, uint32 opin) public {
        // 要求目前时间在提案的时间范围内
        require(
            block.timestamp >= proposals[index].startTime &&
                block.timestamp <= proposals[index].endTime,
            "The proposal is not in the voting period"
        );
        // 要求投票者有足够的token
        require(msg.sender.balance >= 1, "no enough money");
        require(
            proposals[index].proposer != msg.sender,
            "you can't vote yourself"
        );
        proposals[index].vote += opin;
        // 收取一个token
        studentERC20.transferFrom(msg.sender, address(this), 1);
    }
```

### 投票通过发放奖励



### ERC721发币

首先创建`StuERC721`合约。

```solidity

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StuERC721 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("GameItem", "ITM") {}

    function awardItem(address player, string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId); // 铸造代币
        _setTokenURI(newItemId, tokenURI); //设置代币URI

        _tokenIds.increment();
        return newItemId;
    }
}

```

然后生成代币URI。将图片上传到` IPFS`，然后将生成的哈希值加上网址，形成如下的`json`文件

```json
{
    "name": "NFT Art",
    "description": "This image shows the true nature of NFT.",
    "image": "https://ipfs.io/ipfs/QmaG8C3xjF2WjW9LmGWGSHT6ZPhS3AZ4FH3n21wuTccdPb",

}
```

再将json文件上传`ipfs`，获取哈希值，将哈希值和网址保存作为`URI `.

在前端调用该函数，进行发币。

## 项目运行截图

放一些项目运行截图。

项目运行成功的关键页面和流程截图。主要包括操作流程以及和区块链交互的截图。

## 参考内容

课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。

ERC721的创建和部署参考:

+ [ERC721文档](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)

+ [如何创建和部署ERC-721](https://cloud.tencent.com/developer/article/1808621)
