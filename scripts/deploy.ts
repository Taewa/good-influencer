import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const goodInfluencer = await ethers.deployContract("GoodInfluencer", [deployer.address]);

  await goodInfluencer.waitForDeployment();

  const address = await goodInfluencer.getAddress();
  console.log(`deployed goodInfluencer addres is :${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
