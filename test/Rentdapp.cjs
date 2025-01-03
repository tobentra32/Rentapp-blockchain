// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { ethers } = require("hardhat");
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Token contract", function() {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.


  async function deployMyTokenFixture() {
    let MyToken;
    let token;
    let owner, addr1, addr2, addr3;
    const initialSupply = await ethers.parseEther("10000"); // 10000 tokens with 18 decimals
    const tokenPrice = 100000000000000;

    // Contracts are deployed using the first signer/account by default
    [owner, addr1, addr2, addr3] = await ethers.getSigners();


    MyToken = await ethers.getContractFactory("MyToken");

    // Deploy the contract with an initial supply of 1000 tokens
    token = await MyToken.deploy(10000, tokenPrice);
    //await token.deployed();


    return { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice };
  }

  // dont forget to run test for change tokenPrice
  // it should set minter role for an address and allow the address to mint tokens
  // it should emit evnt of minted tokens


  it("should have correct name, symbol, and decimals", async function() {

    const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);

    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
    expect(await token.decimals()).to.equal(18);
  });

  it("should set the right owner and initial supply", async function() {
    const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
    console.log(await token.balanceOf(owner.address));
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  describe("Transfers", function() {
    it("should transfer tokens between accounts", async function() {

      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("100");
      //const amount2 = ethers.BigNumber.from(amount);
      console.log('amount', amount);
      await token.transfer(addr1.address, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      console.log('balance of addr1', await token.balanceOf(addr1.address));
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply - amount);
    });

    it("should emit a Transfer event when transferring", async function() {

      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("50");
      await expect(token.transfer(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("should fail if sender does not have enough tokens", async function() {

      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("2000"); // more than the initial supply
      await expect(token.connect(addr1).transfer(addr2.address, amount)).to.be.revertedWith(
        "Insufficient balance"
      );
    });
  });

  describe("Allowance and Approvals", function() {
    it("should approve tokens for delegated transfer", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("100");
      await token.approve(addr1.address, amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        amount
      );
    });

    it("should emit an Approval event", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("50");
      await expect(token.approve(addr1.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("should allow transferFrom after approval", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      await token
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, amount);

      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply - amount
      );
      expect(await token.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("should fail if transferFrom exceeds allowance", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const amount = ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      await expect(
        token
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, ethers.parseEther("150"))
      ).to.be.revertedWith("Allowance exceeded");
    });
  });

  describe("Public Token Purchase", function() {
    it("should allow users to buy tokens by sending Ether", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice } = await loadFixture(deployMyTokenFixture);
      const etherAmount = ethers.parseEther("1"); // 1 ether
      const tokensToMint = (etherAmount * BigInt(10 ** 18)) / BigInt(tokenPrice); // calculation

      await token.connect(addr1).buyTokens({ value: etherAmount });
      //const tokenAmount = ethSent.mul(ethers.BigNumber.from("10").pow(18)).div(tokenPrice);  // Tokens to be minted
      //const finalBalance = await myToken.balanceOf(addr1.address);

      expect(await token.balanceOf(addr1.address)).to.equal(tokensToMint);
    });

    it("should emit a Transfer event when buying tokens", async function() {
      const { token, initialSupply, owner, addr1, tokenPrice } = await loadFixture(deployMyTokenFixture);
      const etherAmount = ethers.parseEther("1"); // 1 ether
      const tokensToMint = (etherAmount * BigInt(10 ** 18)) / BigInt(tokenPrice); // calculation

      await expect(token.connect(addr1).buyTokens({ value: etherAmount }))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, tokensToMint);



    });

    it("should revert when sending no Ether", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      await expect(token.connect(addr1).buyTokens({ value: 0 })).to.be.revertedWith(
        "Send ETH to buy tokens"
      );
    });
  });

  describe("Withdraw Function", function() {
    it("should allow admin to withdraw funds", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const etherAmount = ethers.parseEther("1");

      await token.connect(addr1).buyTokens({ value: etherAmount });
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      await token.withdraw();

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should revert if a non-admin tries to withdraw", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      await expect(token.connect(addr1).withdraw()).to.be.revertedWith(
        "Caller is not an admin"
      );
    });
  });

  // Testing access control
  describe("Access Control", function() {
    it("should allow the admin to grant and revoke the minter role", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      await token.grantMinterRole(addr1.address);
      expect(await token.hasRole(token.MINTER_ROLE(), addr1.address)).to.equal(
        true
      );

      await token.revokeMinterRole(addr1.address);
      expect(await token.hasRole(token.MINTER_ROLE(), addr1.address)).to.equal(
        false
      );
    });

    it("should prevent non-admins from granting roles", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      await expect(
        token.connect(addr1).grantMinterRole(addr2.address)
      ).to.be.revertedWith("Caller is not an admin");
    });
  });

  // Testing minting and burning
  describe("Minting and Burning", function() {
    it("should allow the owner to mint tokens", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const mintAmount = ethers.parseEther("500");

      await token.grantMinterRole(owner.address);
      await token.mint(owner.address, mintAmount);

      expect(await token.totalSupply()).to.equal(
        initialSupply + mintAmount
      );
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply + mintAmount);
    });

    it("should emit a Transfer event when minting", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const mintAmount = ethers.parseEther("500");

      await token.grantMinterRole(owner.address);
      await expect(token.mint(owner.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, owner.address, mintAmount);
    });

    it("should allow token burning", async function() {
      const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
      const burnAmount = ethers.parseEther("200");

      await token.burn(burnAmount);
      expect(await token.totalSupply()).to.equal(
        initialSupply - burnAmount
      );
    expect(await token.balanceOf(owner.address)).to.equal(
      initialSupply - burnAmount
    );
  });

  it("should emit a Transfer event when burning", async function() {
    const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
    const burnAmount = ethers.parseEther("100");

    await expect(token.burn(burnAmount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, ethers.ZeroAddress, burnAmount);
  });

  it("should prevent non-minters from minting", async function() {
    const { token, initialSupply, owner, addr1, addr2, addr3 } = await loadFixture(deployMyTokenFixture);
    const mintAmount = ethers.parseEther("100");
    await expect(
      token.connect(addr1).mint(addr1.address, mintAmount)
    ).to.be.revertedWith("Caller is not a minter");
  });


});

  describe("Update Token Price", function(){
    it("Should allow admin to update token price", async function () {
      const { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice } = await loadFixture(deployMyTokenFixture);
      // Check the initial token price
      const initialTokenPrice = await token.tokenPrice();
      expect(initialTokenPrice).to.equal(tokenPrice);

      // New token price: 0.5 ETH = 1 token
      const newTokenPrice = ethers.parseEther("0.5");

      // Update the token price as the owner (admin)
      await token.connect(owner).setTokenPrice(newTokenPrice);

      // Verify the new token price
      const updatedTokenPrice = await token.tokenPrice();
      expect(updatedTokenPrice).to.equal(newTokenPrice);
    });

    it("Should revert if non-admin tries to update token price", async function () {
      const { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice} = await loadFixture(deployMyTokenFixture);
      const newTokenPrice = ethers.parseEther("0.5");

      // Try to update token price from addr1, which is not an admin
      await expect(
        token.connect(addr1).setTokenPrice(newTokenPrice)
      ).to.be.revertedWith("Caller is not an admin");
    });

  });

  describe("Minter Role On Another Address and Minting", function(){

    it("Should set minter role for an address and allow it to mint tokens", async function () {
      const { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice } = await loadFixture(deployMyTokenFixture);
      // Owner grants MINTER_ROLE to addr1
      const MINTER_ROLE = await token.MINTER_ROLE();
      await token.grantRole(MINTER_ROLE, addr1.address);

      // Check if addr1 has MINTER_ROLE
      expect(await token.hasRole(MINTER_ROLE, addr1.address)).to.be.true;

      // addr1 mints 100 tokens to addr2
      await expect(token.connect(addr1).mint(addr2.address, ethers.parseEther("100")))
        .to.emit(token, "Mint")  // Expect Mint event
        .withArgs(addr1.address, addr2.address, ethers.parseEther("100")) // Check event arguments
        .to.emit(token, "Transfer")  // Also expect Transfer event from 0x0 to addr2
        .withArgs(ethers.ZeroAddress, addr2.address, ethers.parseEther("100"));

      // Check the new balance of addr2
      const balance = await token.balanceOf(addr2.address);
      expect(balance).to.equal(ethers.parseEther("100"));

      // Check the new total supply after minting
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("10100"));  // Initial 1000 + 100 minted
    });

    it("Should revert if a non-minter tries to mint", async function () {
      const { token, initialSupply, owner, addr1, addr2, addr3, tokenPrice } = await loadFixture(deployMyTokenFixture);
      // addr2 tries to mint without having MINTER_ROLE
      await expect(token.connect(addr2).mint(addr1.address, ethers.parseEther("50")))
        .to.be.revertedWith("Caller is not a minter");
    });

  });

});

