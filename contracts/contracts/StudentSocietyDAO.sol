// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./StuERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract StudentSocietyDAO {
    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);
    uint256 public constant PLAY_AMOUNT = 10; //最开始每人有10个代币
    // 表示提案的状态
    struct Proposal {
        uint32 index; // index of this proposal
        address proposer; // who make this proposal
        uint256 startTime; // proposal start time
        uint256 endTime; // proposal 结束时间
        string name; // proposal name
        uint32 vote; // 支持票 vote+1, 反对票 vote-1

        // TODO add any  if you want
    }
    uint32 succ_num; //成功的提案数
    // a map from student address to student
    mapping(address => uint32) public succ_Map; //通过地址获得每个学生的提案数目
    Proposal[] public proposals; //

    StuERC20 public studentERC20;

    // mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal

    // ...
    // TODO add any variables if you want
    // 为每个提案创建一个合约
    constructor() {
        // maybe you need a constructor
        studentERC20 = new StuERC20("name", "symbol");
    }

    // 提出提案
    function propose(string memory name, uint256 duration) public {
        // TODO
        // 1. create a new proposal
        // duration的单位是秒
        require(msg.sender.balance >= 0, "no enough money");
        // 看是否有相同的提案
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
                0
            )
        );
        emit ProposalInitiated(uint32(proposals.length));
        //收取两个token
        // studentERC20.transferFrom(msg.sender, address(this), 2);
    }

    function getIsFinish(uint32 i) public view returns (uint32) {
        // 如果当前时间比结束时间大，那么就是结束了
        if (block.timestamp > proposals[i].endTime) {
            return 1;
        } else {
            return 0;
        }
    }

    // 对提案进行投票
    // opinion: 1表示支持，-1表示反对
    function getPropoNum() public view returns (uint32) {
        uint32 len = uint32(proposals.length);
        return len;
    }

    function getPropName(uint32 i) public view returns (string memory) {
        string memory n = proposals[i].name;
        return n;
    }
    function getVoteResult(uint32  i) public view returns(uint32){
        return proposals[i].vote;
    }
    function Vote(uint32 index, uint32 opin) public {
        // 要求目前时间在提案的时间范围内
        require(
            block.timestamp >= proposals[index].startTime &&
                block.timestamp <= proposals[index].endTime,
            "The proposal is not in the voting period"
        );
        // 要求投票者有足够的token
        require(msg.sender.balance >= 1, "no enough money");
        proposals[index].vote += opin;
        // 收取一个token
        // studentERC20.transferFrom(msg.sender, address(this), 1);
    }

    // 时间截止后，统计投票结果
    function countVote(uint32 index) public  {
        require(
            block.timestamp >= proposals[index].endTime,
            "The proposal is not over"
        );
       
        if (proposals[index].vote > 0) {
            // 支持票数多，提案通过
            // 把token转给提案发起者
            // studentERC20on.transfer(proposals[index].proposer, 2);
            // 把提案发起人的succ+num++
            succ_Map[proposals[index].proposer] += 1;
         
        } 
    }
        // 根据地址返回mapping值
    function getSuccNum(address addr) public view returns (uint32) {
        return succ_Map[addr];
    }
    function getReward(address addr) public {
        require(succ_Map[addr] >= 3, "no enough succ num");
        // studentERC20.transfer(addr, 1);
    }

    
}
