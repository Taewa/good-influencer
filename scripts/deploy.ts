import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  // const goodInfluencer = await ethers.deployContract("GoodInfluencer", [deployer.address]);
  // await goodInfluencer.waitForDeployment();
  // const address = await goodInfluencer.getAddress();
  // console.log(`deployed goodInfluencer addres is :${address}`);

  const GoodInfluencerFactory = await ethers.getContractFactory("GoodInfluencer");
  const goodInfluencer = await upgrades.deployProxy(
    GoodInfluencerFactory,
    [], 
    {
      initializer: "initialize",
      kind: "transparent",
    }
  )

  await goodInfluencer.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
