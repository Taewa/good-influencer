// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./GoodInfluencer.sol";

contract GoodInfluencerManager {
    GoodInfluencer goodInfluencer;

    struct Achievement {
        bool isEnabled;
        uint256 totalDonation;
        mapping (address => uint256) donation;
    }

    // influencer to achievement
    mapping (address => Achievement) public achievements;
    
    constructor(address payable _goodInfluencer) {
        goodInfluencer = GoodInfluencer(_goodInfluencer);
    }

    modifier onlyRegistered(address _influencer) {
      require(achievements[_influencer].isEnabled, "Only for registered address.");
      _;
    }

    function donate(address _influencer) public payable onlyRegistered(_influencer) {
        require(msg.value > 0, "Minimum ETH is required.");

        // Q: Defining variables are more expensive in terms of gas but better code readability.
        address _donator = msg.sender;
        uint256 _donation = msg.value;

        Achievement storage _achievement = achievements[_influencer];
        
        updateTrophy(_influencer);

        _achievement.totalDonation = _donation + _achievement.totalDonation;
        _achievement.donation[_donator] = _donation + _achievement.donation[_donator];
    }

    /**
    * donator can donate multiple time to an influencer
    * but influencer will get one time per address
    * It's to prevent rich people paying -> more trophy
    */
    function updateTrophy(address _influencer) internal {
        uint256 _donation = achievements[_influencer].donation[msg.sender];

        if (_donation == 0) {
            goodInfluencer.transfer(_influencer, 1);
        }
    }

    function registerInfluencer(address _influencer) external {
        require(msg.sender == _influencer, "Only influencers themselves can register.");

        // To prevent donating a wrong address
        achievements[_influencer].isEnabled = true;
    }

    function withdraw(uint256 _amount) payable external {
        uint256 _totalDonation = achievements[msg.sender].totalDonation;

        require(_totalDonation > 0 && _totalDonation >= _amount , "You cannot withdraw greater than you have.");
        
        achievements[msg.sender].totalDonation -= _amount;

        (bool isSent, ) = address(msg.sender).call{value: _amount}("");

        require(isSent, "Withdraw failed.");
    }
}