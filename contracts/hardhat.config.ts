import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: "http://localhost:8545",
      // the private key of signers, change it according to your ganache user
      accounts: [
        "6f29d8524f34a95ae7787605ab8a3b11598c7c0ad70621d94a595c395317c412",
        "1c4c5d3974c46b9c382ea5ef093399526760391cdacc78859fbcd0fa958ed374",
        "5f48889bc8e8fb8ea46a7a9844063db05d212fa1a9c52ddfa6f16ddd29a0877c",
        "b30f31044a8e2bb1e7ec339bae0dccc562d5848ac449d2ece50aa8d26c7c588f",
        "d5cd6fe7cea9b6a5e1b5212b7d59ff10ee3d13075467c39d2975b2744165ca4d",
      ],
    },
  },
};

export default config;
