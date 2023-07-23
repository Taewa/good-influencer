// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoodInfluencer is Ownable, ERC20 {
    constructor(address initialOwner) Ownable() ERC20("Trophy", "TRP") {}

    function mintToTokenManager(address _manager) external onlyOwner {
        _mint(_manager, 1_000_000);
    }
}