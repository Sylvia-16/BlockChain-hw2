import Addresses from "./contract-addresses.json";

import Lottery from "./abis/StudentSocietyDAO.json";
import MyERC20 from "./abis/StuERC20.json";

const Web3 = require("web3");

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider);

// 修改地址为部署的合约地址
const proposeAddress = Addresses.lottery;
const proposeABI = Lottery.abi;
const stuERC20Address = Addresses.myERC20;
const stuERC20ABI = MyERC20.abi;

// 获取合约实例
const proposeContract = new web3.eth.Contract(proposeABI, proposeAddress);
const stuERC20Contract = new web3.eth.Contract(stuERC20ABI, stuERC20Address);

// 导出web3实例和其它部署的合约
export { web3, proposeContract, stuERC20Contract };
