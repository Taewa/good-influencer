// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract GoodInfluencer is Initializable, OwnableUpgradeable, ERC20Upgradeable {
    function initialize() external initializer {
        __Ownable_init();
        __ERC20_init("Trophy", "TRP");
    }

    function mintToTokenManager(address _manager) external onlyOwner {
        _mint(_manager, 1_000_000);
    }
}