// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";

contract TokenFaucet {
    FaucetToken public immutable token;

    uint256 public constant FAUCET_AMOUNT = 50 ether;
    uint256 public constant COOLDOWN_TIME = 1 days;
    uint256 public constant MAX_CLAIM_AMOUNT = 500 ether;

    address public admin;
    bool private _paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address tokenAddress) {
        token = FaucetToken(tokenAddress);
        admin = msg.sender;
        _paused = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function isPaused() public view returns (bool) {
        return _paused;
    }

    function canClaim(address user) public view returns (bool) {
        if (_paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function requestTokens() external {
        require(!_paused, "Faucet is paused");
        require(canClaim(msg.sender), "Not eligible to claim");
        require(
            remainingAllowance(msg.sender) >= FAUCET_AMOUNT,
            "Lifetime allowance exceeded"
        );

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function setPaused(bool paused_) external onlyAdmin {
        _paused = paused_;
        emit FaucetPaused(paused_);
    }
}
