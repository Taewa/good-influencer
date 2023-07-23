import { ethers, upgrades } from "hardhat";

async function main() {
  /**
   * GoodInfluencer
   */
  const [deployer] = await ethers.getSigners();
  const GoodInfluencer = await ethers.getContractFactory("GoodInfluencer");
  const goodInfluencer = await GoodInfluencer.deploy(deployer.address);
  
  await goodInfluencer.deployed();
  
  const goodInfluencerAddress = goodInfluencer.address;
  console.log('goodInfluencer address:', goodInfluencerAddress);


  /**
   * GoodInfluencerManager (Proxy)
   */
  const ManagerFactory = await ethers.getContractFactory("GoodInfluencerManager");
  const manager = await upgrades.deployProxy(
    ManagerFactory,
    [goodInfluencerAddress], 
    {
      initializer: "initialize",
      kind: "transparent",
    }
  )

  console.log('manager address : ', manager.address);

  /**
   * Minting
   */
  await goodInfluencer.mintToTokenManager(manager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
