// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CustomToken is ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _maxTotalSupply;     // Maximum supply of tokens
    uint256 public tokenPrice;           // Price of 1 token in wei

    constructor(
        string memory name,
        string memory symbol,
        uint256 maxTotalSupply,
        uint256 price
    ) ERC20(name, symbol) ERC20Permit(name) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Set deployer as admin
        _grantRole(MINTER_ROLE, msg.sender);        // Set deployer as minter
        _maxTotalSupply = maxTotalSupply;           // Set max supply
        tokenPrice = price;                         // Set price per token
    }

    /**
     * @dev Allows users to buy tokens by sending ETH.
     * Grants MINTER_ROLE temporarily to mint tokens and then revokes it.
     * @param amount Amount of tokens to buy.
     */
    function buyTokens(uint256 amount) external payable {
        require(
            msg.value == amount * tokenPrice,
            "Incorrect POL sent"
        );
        require(
            totalSupply() + amount <= _maxTotalSupply,
            "Mint exceeds max supply"
        );

        // Grant MINTER_ROLE temporarily
        _grantRole(MINTER_ROLE, msg.sender);

        // Mint tokens to buyer
        _mint(msg.sender, amount);

        // Revoke MINTER_ROLE immediately after minting
        _revokeRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Updates the token price.
     * @param newPrice New price per token in wei.
     */
    function setTokenPrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenPrice = newPrice;
    }
    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }

    /**
     * @dev Allows the admin to withdraw collected ETH.
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @dev Returns the max total supply of tokens.
     */
    function getMaxTotalSupply() public view returns (uint256) {
        return _maxTotalSupply;
    }
}
