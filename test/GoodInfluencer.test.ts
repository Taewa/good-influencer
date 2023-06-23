import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { GoodInfluencer } from "../typechain-types/contracts/GoodInfluencer";

describe('GoodInfluencer', async () => {
  let contract:GoodInfluencer;
  let accounts: HardhatEthersSigner[];
  let deployer:SignerWithAddress;

  beforeEach( async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    contract = await ethers.deployContract("GoodInfluencer", [deployer.address]);

    await contract.waitForDeployment();
    const address = await contract.getAddress();
    // console.log(`deployed goodInfluencer addres is :${address}`);
  });

  it('should have 0 token at the beginning', async () => {
    const totalSupply = await contract.totalSupply();

    expect(totalSupply.toString()).to.be.equal("0", "It should be 0 from the beginning.");
  });

  it('should have 1_000_000 token', async () => {
    await contract
      .connect(deployer)
      .mintToTokenManager(deployer.address);

    const totalSupply = await contract.totalSupply();

    expect(totalSupply.toString()).to.be.equal("1000000", "There should be 1000000 tokens since token is minted.");
  });

  it('should not allow mint if it is not the owner of contract', async () => {
    const notOwner = accounts[9];
    
    await expect(
      contract
      .connect(notOwner)
      .mintToTokenManager(notOwner.address)
    )
    .to.be.revertedWith('Ownable: caller is not the owner');
  });
})