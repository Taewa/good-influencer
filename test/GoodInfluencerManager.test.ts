import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { GoodInfluencer } from "../typechain-types/contracts/GoodInfluencer";
import { GoodInfluencerManager } from "../typechain-types/contracts/GoodInfluencerManager";
import { MockContractForTest } from "../typechain-types/contracts/MockContractForTest";

describe('GoodInfluencerManager', async () => {
  let managerContract:GoodInfluencerManager;
  let influencerContract:GoodInfluencer;
  let accounts: HardhatEthersSigner[];
  let deployer:SignerWithAddress;
  let influencer:SignerWithAddress;
  let donator1:SignerWithAddress;
  let donator2:SignerWithAddress;
  let mockContract:MockContractForTest;

  beforeEach(async() => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    influencer = accounts[1];
    donator1 = accounts[2];
    donator2 = accounts[3];

    const InfluencerContractFactory = await ethers.getContractFactory("GoodInfluencer");

    influencerContract = await InfluencerContractFactory.deploy(deployer.address);

    await influencerContract.deployed();

    // console.log(`deployed GoodInfluencer address is :${influencerContract.address}`);

   /**
    * TODO: It's an issue of upgradeable contract + event emit testing.
    * When "@openzeppelin/hardhat-upgrades" is added hardhat.config.ts, it cannot test event emit.
    * For example: usually getContractFactory() returns a contract that contains 'runner' object.
    * However, after importing "@openzeppelin/hardhat-upgrades", no long 'runner' object which 
    * is required during the event testing (node_modules/@nomicfoundation/hardhat-chai-matchers/src/internal/emit.ts:100)
    * StackExchange: https://ethereum.stackexchange.com/questions/151865/runner-object-doesnt-exist-during-an-event-emit-testing
    *  */ 
   /** :: https://github.com/ethers-io/ethers.js/blob/main/src.ts/providers/contracts.ts ::
   *  A **ContractRunner (runner)** is a generic interface which defines an object
   *  capable of interacting with a Contract on the network.
   *
   *  The more operations supported, the more utility it is capable of.
   *
   *  The most common ContractRunners are [Providers](Provider) which enable
   *  read-only access and [Signers](Signer) which enable write-access.
  */
    const ManagerContractFactory = await ethers.getContractFactory("GoodInfluencerManager");
    managerContract = await upgrades.deployProxy(
      ManagerContractFactory,
      [influencerContract.address], 
      {
        initializer: "initialize",
        kind: "transparent",
      }
    )

    await managerContract.deployed();

    const MockContractForTest = await ethers.getContractFactory("MockContractForTest");
    
    mockContract = await MockContractForTest.deploy(managerContract.address);

    await mockContract.deployed();

    // console.log(`MANGER managerContract.runner is :${managerContract.address}`);
  });

  describe('registerInfluencer()', () => {
    it('should register influencer', async() => {
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer.address);

      const [isEnabled, _] = await managerContract.achievements(influencer.address);
      
      expect(isEnabled).to.be.true;
    });

    it('should not register influencer if msg.sender is not the same', async() => {
      await expect(
        managerContract
        .connect(deployer)  // it should be the same as influencer
        .registerInfluencer(influencer.address)
      ).revertedWith('Only influencers themselves can register.');
    });

    it('should not register if sender is a contract', async() => {
      /**
       * note that the below is an eternal contract. Not the manager contract.
       * this tests to check whether the method accept contract address as parameter or not (it shouldn't)
       */
      await expect(
        mockContract.callRegister() 
      ).revertedWith('A contract is not allowed as influencer.');
    });
  });

  describe('donate()', () => {
    beforeEach(async() => {
      // mint token before test
      // const managerContractAddress = await managerContract.getAddress();
      const managerContractAddress = await managerContract.address;

      await influencerContract
      .connect(deployer)
      .mintToTokenManager(managerContractAddress);  // mint to the manager contract. Now this contract has right to control token (e.g. trophy)
    });

    it('should be able to donate', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer.address);

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

      expect(totalDonatedAmount.toNumber()).to.be.equal(120, '100 + 20 = 120');
    });

    it('should not be able to donate if account sends 0 ETH', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer.address);

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

    it('should not be able to donate if donator and receiver is the same', async() => {
      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer.address);

      await expect(
        managerContract
          .connect(influencer)
          .donate(influencer.address, { // <- donating itself
            from: influencer.address,
            value: 500
          })
      ).revertedWith('You cannot donate youself.');
    });

    it('should have a trophy after a donation', async() => {
       // set up influencer
       await managerContract
       .connect(influencer)
       .registerInfluencer(influencer.address);

      // donate 1
      await managerContract
        .connect(donator1)
        .donate(influencer.address, {
          from: donator1.address,
          value: 100  // 100 wei
      });

      const numTrophy = await influencerContract.balanceOf(influencer.address);

      expect(numTrophy.toNumber()).to.be.equal(1);
    });

    it('should have a trophy after two donations', async() => {
      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer.address);

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

     expect(numTrophy.toNumber()).to.be.equal(1, 'even if donator1 donated 2 times, the trophy should be counted as 1.');
    });

    it('should have two trophy after two donations by different donators', async() => {
      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer.address);

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

      expect(numTrophy.toNumber()).to.be.equal(2, 'since donator1 and donator2 are 2 different addresses, trophy should be incresed.');
    });

    xit('should emit Donate event after donation() execution', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer.address);
      
        // // donate 1
      await expect(
        managerContract
          .connect(donator1)
          .donate(influencer.address, {
            from: donator1.address,
            value: 100  // 100 wei
        }))
      .to.emit(managerContract, "Donate")
      .withArgs(
        donator1.address,
        influencer.address,
        100,
      );
    });

    xit('should emit EarnTrophy event after updateTrophy() execution', async() => {
      // set up influencer
      await managerContract
        .connect(influencer)
        .registerInfluencer(influencer.address);
 
      // donate 1
      await expect(
        managerContract
          .connect(donator1)
          .donate(influencer.address, {
            from: donator1.address,
            value: 100  // 100 wei
        }))
      .to.emit(managerContract, "EarnTrophy") // updateTrophy() is an internal fn and executed by donate()
      .withArgs(
        donator1.address,
        influencer.address,
      );
    });
  });

  describe('withdraw()', async() => {
    beforeEach(async() => {
      // mint token before test
      // const managerContractAddress = await managerContract.getAddress();
      const managerContractAddress = await managerContract.address;

      await influencerContract
      .connect(deployer)
      .mintToTokenManager(managerContractAddress);  // mint to the manager contract. Now this contract has right to control token (e.g. trophy)

      // set up influencer
      await managerContract
      .connect(influencer)
      .registerInfluencer(influencer.address);

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

      expect(totalDonatedAmount.toNumber()).to.be.equal(0);
    });

    it('should be able to withdraw multiple times as influencer', async() => {
      await managerContract
        .connect(influencer)
        .withdraw(60);

      await managerContract
        .connect(influencer)
        .withdraw(60);
      
        const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);

      expect(totalDonatedAmount.toNumber()).to.be.equal(0);
    });

    it('should not be able to withdraw as influencer if the amount is exceeded', async() => {
      await expect(
        managerContract
        .connect(influencer)
        .withdraw(130)
      ).revertedWith('You cannot withdraw greater than you have.');

      const [_, totalDonatedAmount] = await managerContract.achievements(influencer.address);

      expect(totalDonatedAmount.toNumber()).to.be.equal(120);  // 100 + 20
    });

    it('should not be able to withdraw if withdrawer is a contract', async() => {
      /**
       * note that the below is an eternal contract. Not the manager contract.
       * this tests to check whether the method accept contract as msg.sender or not (it shouldn't)
       */
      await expect(
        mockContract.callWithdraw()
      ).revertedWith('A contract is not allowed to withdraw.');
    });

    xit('should emit Withdraw event after withdraw() execution', async () => {
      await expect(
        managerContract
          .connect(influencer)
          .withdraw(120) // 100 + 20
      ).to.emit(managerContract, "Withdraw")
      .withArgs(
        influencer.address,
        120,
      );
    });
  });
});