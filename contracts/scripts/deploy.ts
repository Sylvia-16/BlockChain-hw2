import { ethers } from "hardhat";

async function main() {
  const StudentSocietyDAO = await ethers.getContractFactory(
    "StudentSocietyDAO"
  );
  const studentSocietyDAO = await StudentSocietyDAO.deploy();
  await studentSocietyDAO.deployed();
  console.log(
    `studentSocietyDAO contract has been deployed successfully in ${studentSocietyDAO.address}`
  );

  const stuERC20 = await studentSocietyDAO.studentERC20();
  console.log(`stuerc20 contract has been deployed successfully in ${stuERC20}`);
  const stuERC721 = await studentSocietyDAO.studentERC721();
  console.log(`stuerc721 contract has been deployed successfully in ${stuERC721}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
