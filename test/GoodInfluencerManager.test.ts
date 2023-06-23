import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { GoodInfluencer } from "../typechain-types/contracts/GoodInfluencer";
import { GoodInfluencerManager } from "../typechain-types/contracts/GoodInfluencerManager";

describe('GoodInfluencerManager', async () => {
  let managerContract:GoodInfluencerManager;
  let influencerContract:GoodInfluencer;
  let accounts: HardhatEthersSigner[];
  let deployer:SignerWithAddress;
  let influencer:SignerWithAddress;
  let donator1:SignerWithAddress;
  let donator2:SignerWithAddress;

  beforeEach(async() => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    influencer = accounts[1];
    donator1 = accounts[2];
    donator2 = accounts[3];
    
    influencerContract = await ethers.deployContract("GoodInfluencer", [deployer.address]);
    await influencerContract.waitForDeployment();
    const influencerContractAddress = await influencerContract.getAddress();
    // console.log(`deployed goodInfluencer addres is :${influencerContractAddress}`);

    managerContract = await ethers.deployContract("GoodInfluencerManager", [influencerContractAddress]);
    await managerContract.waitForDeployment();
    // const managerContractAddress = await managerContract.getAddress();
    // console.log(`deployed GoodInfluencerManager addres is :${managerContractAddress}`);
  });

  describe('registerInfluencer()', () => {
    it('should register influencer', async() => {
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer);

      const [isEnabled, _] = await managerContract.achievements(influencer);
      
      expect(isEnabled).to.be.true;
    });

    it('should not register influencer', async() => {
      await expect(
        managerContract
        .connect(deployer)  // it should be the same as influencer
        .registerInfluencer(influencer)
      ).revertedWith('Only influencers themselves can register.');
    });
  });

  describe('donate()', () => {
    beforeEach(async() => {
      // mint token before test
      const managerContractAddress = await managerContract.getAddress();

      await influencerContract
      .connect(deployer)
      .mintToTokenManager(managerContractAddress);  // mint to the manager contract. Now this contract has right to control token (e.g. trophy)
    });

    it('should be able to donate', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer);

      // donate 1
      await managerContract
        .connect(donator1)
        .donate(influencer.address, {
          from: donator1.address,
          // value: ethers.parseEther("1.0")
          value: 100  // 100 wei
        });

      // donate 2
      await managerContract
        .connect(donator2)
        .donate(influencer.address, {
          from: donator2.address,
          value: 20
        });

      const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);
      
      expect(totalDonatedAmount).to.be.equal(120, '100 + 20 = 120');
    });

    it('should not be able to donate if account sends 0 ETH', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer);

      await expect(
        managerContract
          .connect(donator1)
          .donate(influencer.address, {
            from: donator1.address,
            value: 0  // <- send 0
          })
      ).revertedWith('Minimum ETH is required.');
    });

    it('should not be able to donate to a unregistered account', async() => {
      await expect(
        managerContract
          .connect(donator1)
          .donate(donator2.address, { // <- not registered account
            from: donator1.address,
            value: 500
          })
      ).revertedWith('Only for registered address.');
    });

    it('should have a trophy after a donation', async() => {
       // set up influencer
       await managerContract
       .connect(influencer)
       .registerInfluencer(influencer);

      // donate 1
      await managerContract
        .connect(donator1)
        .donate(influencer.address, {
          from: donator1.address,
          value: 100  // 100 wei
      });

      const numTrophy = await influencerContract.balanceOf(influencer.address);

      expect(numTrophy).to.be.equal(1);
    });

    it('should have a trophy after two donations', async() => {
      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer);

      // donate 1
      await managerContract
       .connect(donator1)
       .donate(influencer.address, {
         from: donator1.address,
         value: 100  // 100 wei
      });

      // donate 1
      await managerContract
        .connect(donator1)  // <- note that it still donator1
        .donate(influencer.address, {
          from: donator1.address,
          value: 20
      });

     const numTrophy = await influencerContract.balanceOf(influencer.address);

     expect(numTrophy).to.be.equal(1, 'even if donator1 donated 2 times, the trophy should be counted as 1.');
    });

    it('should have two trophy after two donations by different donators', async() => {
      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer);

      // donate 1
      await managerContract
       .connect(donator1)
       .donate(influencer.address, {
         from: donator1.address,
         value: 100  // 100 wei
      });

      // donate 2
      await managerContract
        .connect(donator2)  // <- note that it's donator2 not 1
        .donate(influencer.address, {
          from: donator2.address,
          value: 20
      });

      const numTrophy = await influencerContract.balanceOf(influencer.address);

      expect(numTrophy).to.be.equal(2, 'since donator1 and donator2 are 2 different addresses, trophy should be incresed.');
    });
  });

  describe('withdraw()', async() => {
    beforeEach(async() => {
      // mint token before test
      const managerContractAddress = await managerContract.getAddress();

      await influencerContract
      .connect(deployer)
      .mintToTokenManager(managerContractAddress);  // mint to the manager contract. Now this contract has right to control token (e.g. trophy)

      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer);

      // donate 1
      await managerContract
        .connect(donator1)
        .donate(influencer.address, {
          from: donator1.address,
          // value: ethers.parseEther("1.0")
          value: 100  // 100 wei
        });

      // donate 2
      await managerContract
        .connect(donator2)
        .donate(influencer.address, {
          from: donator2.address,
          value: 20
        });
    });   

    it('should be able to withdraw as influencer', async() => {
      await managerContract
        .connect(influencer)
        .withdraw(120); // 100 + 20

      const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);

      expect(totalDonatedAmount).to.be.equal(0);
    });

    it('should be able to withdraw multiple times as influencer', async() => {
      await managerContract
        .connect(influencer)
        .withdraw(60);

      await managerContract
        .connect(influencer)
        .withdraw(60);
      
        const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);

      expect(totalDonatedAmount).to.be.equal(0);
    });

    it('should be not able to withdraw as influencer if the amount is exceeded', async() => {
      await expect(
        managerContract
        .connect(influencer)
        .withdraw(130)
      ).revertedWith('You cannot withdraw greater than you have.');

      const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);

      expect(totalDonatedAmount).to.be.equal(120);  // 100 + 20
    });
  });
});