// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "../GoodInfluencerManager.sol";

contract MockContractForTest {
    GoodInfluencerManager goodInfluencerManager;

    constructor(address _goodInfluencerManager) {

        goodInfluencerManager = GoodInfluencerManager(_goodInfluencerManager);
    }

    // For GoodInfluencerManager contract "registerInfluencer()" testing
    function callRegister() external {
        goodInfluencerManager.registerInfluencer(address(this));
    }

    // For GoodInfluencerManager contract "withdraw()" testing
    function callWithdraw() external {
        goodInfluencerManager.withdraw(10);
    }
}