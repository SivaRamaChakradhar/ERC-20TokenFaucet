// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FaucetToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 ether;

    address public faucet;
    address public admin;

    constructor() ERC20("Faucet Token", "FTK") {
        admin = msg.sender;
    }

    modifier onlyFaucet() {
        require(msg.sender == faucet, "Only faucet can mint");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function setFaucet(address _faucet) external onlyAdmin {
        require(faucet == address(0), "Faucet already set");
        faucet = _faucet;
    }

    function mint(address to, uint256 amount) external onlyFaucet {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
