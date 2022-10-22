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
        uint256 duration; // proposal duration
        string name; // proposal name
        uint32 vote; // 支持票 vote+1, 反对票 vote-1

        // TODO add any  if you want
    }
    Proposal[] public proposals; //

    StuERC20 studentERC20;
    mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal

    // ...
    // TODO add any variables if you want
    // 为每个提案创建一个合约
    constructor() {
        // maybe you need a constructor
        studentERC20 = new StuERC20("name", "symbol");
    }

    //领取token
    function JoinIn() public {
        studentERC20.transferFrom(msg.sender, address(this), PLAY_AMOUNT);
    }

    // 提出提案
    function propose(string memory name, uint256 duration) public {
        // TODO
        // 1. create a new proposal
        require(msg.sender.balance >= 0, "no enough money");
        // 看是否有相同的提案
        for (uint256 i = 1; i < proposals.length; i++) {
            if (proposals[i].name == name) {
                revert("The proposal has been proposed");
                break;
            }
        }
        // 把提案加入到队列中
        proposals.push(
            Proposal(
                proposals.length,
                msg.sender,
                block.timestamp,
                duration,
                name,
                0
            )
        );
        emit ProposalInitiated(proposals.length);
        //收取两个token
        studentERC20.transferFrom(msg.sender, address(this), 2);
    }

    // 对提案进行投票
    // opinion: 1表示支持，-1表示反对
    function vote(uint32 index, uint32 opin) public {
        // 要求目前时间在提案的时间范围内
        require(
            block.timestamp >= proposals[index].startTime &&
                block.timestamp <=
                proposals[index].startTime + proposals[index].duration,
            "The proposal is not in the voting period"
        );
        // 要求投票者有足够的token
        require(msg.sender.balance >= 1, "no enough money");
        proposals[index].vote += opin;
        // 收取一个token
        studentERC20.transferFrom(msg.sender, address(this), 1);
    }

    // 时间截止后，统计投票结果
    function countVote(uint32 index) public {
        require(
            block.timestamp>=proposals[index].startTime+proposals[index].duration,
            "The proposal is not over"
        );
        if(proposals[index].vote>0){
            // 支持票数多，提案通过
            // 把token转给提案发起者
            studentERC20.transfer(proposals[index].proposer, 2);
        }
    }

}
