// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./GoodInfluencer.sol";

contract GoodInfluencerManager is Initializable {
    GoodInfluencer goodInfluencer;

    event Donate(address indexed donator, address indexed receiver, uint256 amount);
    event EarnTrophy(address indexed donator, address indexed receiver);
    event Withdraw(address indexed influencer, uint256 amount);
    event RegisteringInfluencer(address indexed influencer, uint256 when);

    struct Achievement {
        bool isEnabled;
        uint256 totalDonation;
        mapping (address => uint256) donation;
    }

    // influencer to achievement
    mapping (address => Achievement) public achievements;

    modifier onlyRegistered(address _influencer) {
        require(achievements[_influencer].isEnabled, "Only for registered address.");
        _;
    }
    
    // For upgradeable contract
    function initialize(address payable _goodInfluencer) external initializer {
        goodInfluencer = GoodInfluencer(_goodInfluencer);
    }

    function registerInfluencer(address _influencer) external {
        require(msg.sender == _influencer, "Only influencers themselves can register.");
        
        bool _isContract = false;

        assembly {
            // Check whether given address is a contract or not. If it's greater than 0, it's a contract otherwise an account.
            _isContract := gt(extcodesize(_influencer), 0)
        }

        require(!_isContract, 'A contract is not allowed as influencer.');

        // To prevent donating a wrong address
        achievements[_influencer].isEnabled = true;

        emit RegisteringInfluencer(_influencer, block.timestamp);
    }

    function withdraw(uint256 _amount) payable external {
        bool _isContract = false;

        assembly {
            // Check whether given address is a contract or not. If it's greater than 0, it's a contract otherwise an account.
            _isContract := gt(extcodesize(caller()), 0)
        }

        require(!_isContract, 'A contract is not allowed to withdraw.');

        uint256 _totalDonation = achievements[msg.sender].totalDonation;

        require(_totalDonation > 0 && _totalDonation >= _amount , "You cannot withdraw greater than you have.");
        
        achievements[msg.sender].totalDonation -= _amount;

        (bool isSent, ) = address(msg.sender).call{value: _amount}("");

        emit Withdraw(msg.sender, _amount);

        require(isSent, "Withdraw failed.");
    }

    function isRegisteredInfluencer(address _influencer) external view returns(bool) {
        return achievements[_influencer].isEnabled;
    }

    function donate(address _influencer) public payable onlyRegistered(_influencer) {
        require(msg.value > 0, "Minimum ETH is required.");

        // Defining variables are tiny a bit more expensive in terms of gas but better code readability.
        address _donator = msg.sender;
        uint256 _donation = msg.value;
        
        require(_donator != _influencer, "You cannot donate youself.");

        Achievement storage _achievement = achievements[_influencer];

        _achievement.totalDonation = _donation + _achievement.totalDonation;
        _achievement.donation[_donator] = _donation + _achievement.donation[_donator];

        emit Donate(_donator, _influencer, _donation);
        
        updateTrophy(_influencer);
    }

    /**
    * donator can donate multiple time to an influencer
    * but influencer will get one time per address
    * It's to prevent rich people paying -> more trophy
    */
    function updateTrophy(address _influencer) internal {
        uint256 _donation = achievements[_influencer].donation[msg.sender];

        if (_donation == 0) {
            bool result = goodInfluencer.transfer(_influencer, 1);  // Always 1 trophy per address
            require(result, 'Trophy Transfer has failed.');

            emit EarnTrophy(msg.sender, _influencer);
        }
    }
}