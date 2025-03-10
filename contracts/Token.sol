// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20Permit, Ownable {
    uint256 public constant TOKEN_PRICE = 0.01 ether; // Price per token in ETH

    constructor() ERC20("Rentdapp Token", "RDT") ERC20Permit("MyPermitToken") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint initial supply to owner
    }

    // Allow users to buy tokens by sending ETH
    function buyTokens() external payable {
        require(msg.value > 0, "No ETH sent");

        uint256 amountToBuy = (msg.value * 10 ** decimals()) / TOKEN_PRICE;
        require(balanceOf(owner()) >= amountToBuy, "Not enough tokens available for sale");

        _transfer(owner(), msg.sender, amountToBuy);
    }

    // Withdraw contract balance to the owner
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
