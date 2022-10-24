import { ethers } from "hardhat";

async function main() {
  const StudentSocietyDAO = await ethers.getContractFactory("StudentSocietyDAO");
  const stuERC20=await ethers.getContractFactory("StuERC20");
  const studentSocietyDAO = await StudentSocietyDAO.deploy();
  await studentSocietyDAO.deployed();
  await stuERC20.deployed();
  console.log('approve')
 
  await stuERC20.methods.approve(studentSocietyDAO.address, 10000)
  console.log(`StudentSocietyDAO deployed to ${studentSocietyDAO.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
