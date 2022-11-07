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

4. 将合约部署到`ganache`，运行如下的命令。

    ```
    npx hardhat run scripts/deploy.ts --network ganache
    ```

5. 将部署后`StudentSocietyDAO`、`stuERC20`、`stuERC721`的地址复制到`src\utils\contract-addresses.json`中。并且将三个abi复制到前端的`src\utils\abis`文件夹中的响应文件。

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

在结束之后前端调用`AwardToken`给相应的投票人发放奖励。

```js
  function AwardToken(uint32 index) public {
        require(
            block.timestamp >= proposals[index].endTime,
            "The proposal is not over"
        );

        if (proposals[index].vote > 0) {
            // 支持票数多，提案通过
            // 把token转给提案发起者
            studentERC20.transfer(proposals[index].proposer, 2);
            // 把提案发起人的succ+num++
            succ_Map[proposals[index].proposer] += 1;
            proposals[index].isAwarded = 1;
        }
    }
```



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

在前端首先检查该学生是否成功投票三次，若是，则调用该函数，进行发币。

```javascript
await stuERC721Contract.methods
          .awardItem(account, 'https://ipfs.io/ipfs/QmZS4LgipyEdForqdWgVBBQGZUyjzpTsNWBehXA4dSLJAn')
          .send({
            from: account,
          });
```

并且调用`balanceOf`进行查询nft的数目。

```js
 const getNftNum = async () => {
      if (stuERC721Contract) {
        const sn = await stuERC721Contract.methods.balanceOf(account).call();
        setnft(sn);
      } else {
        alert('Contract not exists.');
      }
    };
```



## 项目运行截图

放一些项目运行截图。

项目运行成功的关键页面和流程截图。主要包括操作流程以及和区块链交互的截图。

### 发起提案

在成功启动项目之后，进入如下界面。

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107132632124.png" alt="image-20221107132632124" style="zoom: 33%;" />

首先点击加入社团。

在metamask上会出现如下的界面：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107132819282.png" alt="image-20221107132819282" style="zoom: 67%;" />

确认交易之后在前端会出现如下提示：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107132858186.png" alt="image-20221107132858186" style="zoom: 50%;" />

并且在metamask记录如下的活动：

![image-20221107133051016](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133051016.png)

该区块多了一条交易记录：

![image-20221107133139173](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133139173.png)

并且可以通过界面中的查看个人信息看到目前的token数目为

![image-20221107133243968](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133243968.png)



有了token之后我们就可以进行发起提案

![image-20221107133418060](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133418060.png)

输入提案名称和持续时间之后点击submit按钮，提交提案。

并且需要在metamask中确认允许`propose`合同访问资金。

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133454394.png" alt="image-20221107133454394" style="zoom:67%;" />

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133556389.png" alt="image-20221107133556389" style="zoom:67%;" />

并且确认propose函数的操作。

然后我们可以看到前端提示：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133629048.png" alt="image-20221107133629048" style="zoom: 67%;" />

并且在列表中成功显示：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133644605.png" alt="image-20221107133644605" style="zoom:50%;" />



在ganache上也可以看到两个新`transaction`

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133831928.png" alt="image-20221107133831928" style="zoom:50%;" />

这个为approve

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107133846213.png" alt="image-20221107133846213" style="zoom:50%;" />

这个为propose

重复提案操作，我们发起三个提案。

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107134113573.png" alt="image-20221107134113573" style="zoom: 50%;" />

(因为时间原因，第0个提案已经结束了)。

### 投票

因为不能对自己的提案进行投票，我们切换账户，进行投票。



![image-20221107134403620](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107134403620.png)

点击上图表格中的支持按钮：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107134721695.png" alt="image-20221107134721695" style="zoom: 50%;" />

在metamask 中确认。

在确认之后前端提示投票成功

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107134801269.png" alt="image-20221107134801269" style="zoom:50%;" />

然后在区块链中显示如下transaction：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107134813504.png" alt="image-20221107134813504" style="zoom: 33%;" />



### 查看投票结果

当投票结束之后，就可以查看投票结果：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107135044792.png" alt="image-20221107135044792" style="zoom:50%;" />

如果投票通过，前端界面会调用函数发放奖励：

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107135151935.png" alt="image-20221107135151935" style="zoom:33%;" />

我们可以看到，原本成功的提案数目为2，token数目为9988，在再成功一个提案之后，可以看到token有9990个。

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107142353584.png" alt="image-20221107142353584" style="zoom:50%;" />

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107142601607.png" alt="image-20221107142601607" style="zoom:50%;" />

当前端检测到提案数目为3时，会给该用户发nft。

<img src="D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107142624583.png" alt="image-20221107142624583" style="zoom:50%;" />

我们在metamask中看到该transaction

![image-20221107142647650](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107142647650.png)

并且在ganache中查看。

![image-20221107142716425](D:\Syliva\大三上\区块链\hw2\ZJU-blockchain-course-2022\assets\image-20221107142716425.png)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

## 参考内容

课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。

ERC721的创建和部署参考:

+ [ERC721文档](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)

+ [如何创建和部署ERC-721](https://cloud.tencent.com/developer/article/1808621)
