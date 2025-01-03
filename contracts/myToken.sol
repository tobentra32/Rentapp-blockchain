// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";


contract MyToken is AccessControl, ERC20Permit  {



    string public name = "IleToken";
    string public symbol = "ILE";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    uint256 public tokenPrice;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed minter, address indexed to, uint256 value);  // Mint event

    constructor(uint256 initialSupply, uint256 initialTokenPrice) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;

        tokenPrice = initialTokenPrice;
    }

    function setTokenPrice(uint256 newPrice) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        tokenPrice = newPrice;
    }
    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "Cannot transfer to the zero address");
        require(balanceOf[from] >= value, "Insufficient balance");

        balanceOf[from] -= value;
        balanceOf[to] += value;

        emit Transfer(from, to, value);
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        _transfer(from, to, value);
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) public returns (bool success) {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        totalSupply += value;
        balanceOf[to] += value;
        emit Mint(msg.sender, to, value); // Emit mint event
        emit Transfer(address(0), to, value);
        return true;
    }


    function burn(uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance to burn");
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        emit Transfer(msg.sender, address(0), value);
        return true;
    }

    // Function to withdraw the funds from the contract
    function withdraw() public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        payable(msg.sender).transfer(address(this).balance);  // Send all contract funds to the admin
    }
    // Public minting function where users pay Ether to mint tokens
    function buyTokens() public payable returns (bool success) {
        require(msg.value > 0, "Send Amoy to buy tokens");

        // Calculate the number of tokens to mint based on the token price
        uint256 tokensToMint = (msg.value * 10 ** uint256(decimals)) / tokenPrice;

        // Mint the tokens for the buyer (msg.sender)
        totalSupply += tokensToMint;
        balanceOf[msg.sender] += tokensToMint;

        emit Transfer(address(0), msg.sender, tokensToMint);
        return true;
    }

    function checkAllowance(address owner, address spender) public view returns (uint256 remaining) {
        return allowance[owner][spender];
    }

    function grantMinterRole(address account) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        revokeRole(MINTER_ROLE, account);
    }
}