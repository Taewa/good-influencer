import { ethers, upgrades } from "hardhat";
// Sepolia testnet
// goodInfluencer address: 0x6609ECB6a0fa994a42d23ee8AB06E60B555c29Ba
// manager address :       0x69363b08DcE61B6Be2479130DF8D7293a6BD1A06

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
