const { expect } = require("chai");

const { ethers } = require("hardhat");

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
describe("Rentdapp  contract", function () {

  let Rentdapp, rentdapp;
  let token, owner, addr1, addr2;
  const utilityFee = ethers.parseEther("0.0016");
  const initialAllowance = ethers.parseEther("999999");
  const id = 1
  const bookingId = 0
  const taxPercent = 7
  const securityFee = 5
  const name = 'First apartment'
  const location = 'PHC'
  const newName = 'Update apartment'
  const description = 'Lorem Ipsum dalum'
  const category = 'island'
  const images = [
    'https://a0.muscache.com/im/pictures/miso/Hosting-3524556/original/24e9b114-7db5-4fab-8994-bc16f263ad1d.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-5264493/original/10d2c21f-84c2-46c5-b20b-b51d1c2c971a.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/prohost-api/Hosting-584469386220279136/original/227d4c26-43d5-42da-ad84-d039515c0bad.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-610511843622686196/original/253bfa1e-8c53-4dc0-a3af-0a75728c0708.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-535385560957380751/original/90cc1db6-d31c-48d5-80e8-47259e750d30.jpeg?im_w=720',
  ]
  const rooms = 4
  const price = 2.7
  const twoMonthsInSeconds = 60 * 60 * 24 * 30 * 2; // 2 months in seconds
  const deadline = Math.floor(Date.now() / 1000) + twoMonthsInSeconds;

  const newPrice = 1.3

  
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat

  async function deployRentappFixture() {

    // Deploy the token contract
    
    const PermitToken = await ethers.getContractFactory("Token");

    // Define constructor arguments
    const name = "Permit Token";
    const symbol = "PTKN";
    const maxTotalSupply = ethers.parseUnits("1000000", 18); // 1 million tokens
    const price = ethers.parseUnits("0.0001", 18); // 0.01 ETH per token

    // Deploy the contract with arguments
    const permitToken = await PermitToken.deploy(name, symbol, maxTotalSupply, price);
    await permitToken.waitForDeployment();

    console.log("PermitToken deployed to:", await permitToken.getAddress());

    // Get the Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    

    Rentdapp = await ethers.getContractFactory("Rentdapp");

    // Deploy the contract with arguments
    rentdapp = await Rentdapp.deploy(await permitToken.getAddress());


    await rentdapp.waitForDeployment();
    

    async function generatePermitSignature(signer) {
      const domain = {
        name: await permitToken.name(),
        version: "1",
        chainId: 80002,
        verifyingContract: await permitToken.getAddress(),
      };
  
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
  
      const nonce = await permitToken.nonces(signer.getAddress());
      const message = {
        owner: signer.address,
        spender: rentdapp.getAddress(),
        value: initialAllowance.toString(),
        nonce: nonce.toString(),
        deadline,
      };
  
      const signature = await signer._signTypedData(domain, types, message);
      return ethers.utils.splitSignature(signature);
    }
    const { v, r, s } = await generatePermitSignature(addr1);

    
    // Fixtures can return anything you consider useful for your tests
    
    return { rentdapp, permitToken, owner, addr1, addr2, v, r, s };
  }

  async function generatePermitSignature(signer) {
    const domain = {
      name: await permitToken.name(),
      version: "1",
      chainId: 80002,
      verifyingContract: permitToken.getAddress(),
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await permitToken.nonces(signer.address);
    const message = {
      owner: signer.address,
      spender: rentdapp.getAdrress(),
      value: initialAllowance.toString(),
      nonce: nonce.toString(),
      deadline,
    };

    const signature = await signer._signTypedData(domain, types, message);
    return ethers.utils.splitSignature(signature);
  }
  // Network to that snapshot in every test.

  it("Should set the correct owner and utility fee", async function () {
    // We use loadFixture to setup our environment, and then assert that things went well
    const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
    expect(await rentdapp.owner()).to.equal(owner.address);
    expect(await rentdapp.getUtilityFee()).to.equal(utilityFee);
  });
  it("Should allow the owner to set the utility fee", async function () {
    const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
    const newUtilityFee = ethers.utils.parseEther("0.002");
    await rentdapp.connect(owner).setUtilityFee(newUtilityFee);
    expect(await rentdapp.getUtilityFee()).to.equal(newUtilityFee);
  });
  it("Should not allow non-owners to set the utility fee", async function () {
    const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
    const newUtilityFee = ethers.utils.parseEther("0.002");
    await expect(rentdapp.connect(addr1).setUtilityFee(newUtilityFee)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  describe("Create Apartment", function () {

    

    it('Should create an apartment successfully', async () => {

      const { rentdapp, permitToken, owner, addr1, addr2} = await loadFixture(deployRentappFixture);

      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      const { v, r, s } = await generatePermitSignature(addr1);

      const tx = await rentdapp.connect(addr1).createAppartment(name, description, category, location, images.join(','), rooms, toWei(price), deadline, v, r, s);

      const receipt = await tx.wait();
      await expect(tx).to.emit(rentdapp, "ApartmentCreated").withArgs(
        name,
        price,
        addr1.address,
        1 // Apartment ID
      );

      result = await contract.getApartments()
      expect(result).to.have.lengthOf(1)
    
      result = await contract.getApartment(id)
      expect(result.name).to.be.equal(name)
      expect(result.description).to.be.equal(description)
      expect(result.images).to.be.equal(images.join(','))
    })
   
    it("Should revert if required fields are empty", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      

      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      

      await expect( rentdapp.connect(addr1).createAppartment("", description, location, images.join(','), rooms, toWei(price), deadline, v, r, s)
        ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Update Apartment", function () {
    
    
    
    it('Should confirm apartment update', async () => {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      const tx = await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      const receipt = await tx.wait();

      result = await rentdapp.getApartment(id)
      expect(result.name).to.be.equal(name)
      expect(result.price).to.be.equal(toWei(price))
    
      await rentdapp.connect(addr1).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s)
    
      result = await contract.getApartment(id)
      expect(result.name).to.be.equal(newName)
      expect(result.price).to.be.equal(toWei(newPrice))
    });

    it("Should revert if unauthorized user attempts to update", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);

      await rentdapp.connect(addr2).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s).to.be.revertedWith("Unauthorized entity");
    });

    it("Should revert if apartment does not exist", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(addr1).updateAppartment(999,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s).to.be.revertedWith("Apartment does not exist");
    });
    it("Should revert if deadline has passed", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(addr1).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , Math.floor(Date.now() / 1000) - 3600, v, r, s).to.be.revertedWith("Deadline has passed");
    });
    it("Should revert if signature is invalid", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(owner).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, 1, r, s).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Delete Apartment", function () {
    

    it("Should delete an apartment successfully", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      result = await rentdapp.getApartments();
      expect(result).to.have.lengthOf(1);
      result = await rentdapp.getApartment(id);
      expect(result.deleted).to.be.equal(false)    
      await rentdapp.connect(addr1).deleteApartment(id, deadline, v, r, s);
      result = await contract.getApartments()
      expect(result).to.have.lengthOf(0)
      const apartment = await rentdapp.getApartment(id);
      expect(apartment.deleted).to.equal(true);
    });
    
    it("Should revert if unauthorized user attempts to delete", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      // Step 1: addr1 purchases tokens from MyToken
      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));
      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(addr2).deleteApartment(id, deadline, v, r, s).to.be.revertedWith("Unauthorized entity");
    });
  });

  describe("Booking Functions", function () {
    it("Should book an apartment", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await contract.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2);
      

      result = await rentdapp.getBookings(id)
      expect(result).to.have.lengthOf(dates.length)

      result = await contract.getUnavailableDates(id)
      expect(result).to.have.lengthOf(dates.length)
      // Check if the apartment is booked
      const booking = await rentdapp.getBooking(id, dates[0]);
      expect(booking.booked).to.equal(true);
    });
    it('Should confirm qualified reviewers', async () => {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2);
      result = await rentdapp.getQualifiedReviewers(id)
      expect(result).to.have.lengthOf(0)

      await rentdapp.connect(addr2).checkInApartment(id, 1, deadline, v2, r2, s2)

      result = await rentdapp.getQualifiedReviewers(id)
      expect(result).to.have.lengthOf(1)
    })

    it('Should confirm apartment checking in', async () => {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2);


      result = await rentdapp.getBooking(id, bookingId)
      expect(result.checked).to.be.equal(false)

      result = await rentdapp.connect(addr2).tenantBooked(id)
      expect(result).to.be.equal(false)

      await rentdapp.connect(addr1).checkInApartment(id, bookingId,deadline, v2, r2, s2)

      result = await rentdapp.getBooking(id, bookingId)
      expect(result.checked).to.be.equal(true)
``
      result = await rentdapp.connect(addr2).tenantBooked(id)
      expect(result).to.be.equal(true)
    })

   
  });

  describe("Successful Check-In", function () {
    it("Should allow tenant to check in successfully", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)
      

      
      const booking = await rentdapp.bookingsOf(apartmentId, bookingId);

     

      // Perform check-in
      await rentdapp.connect(addr2).checkInApartment(id, bookingId,deadline, v2, r2, s2)

      const updatedBooking = await rentdapp.bookingsOf(apartmentId, bookingId);
      expect(updatedBooking.checked).to.equal(true);
    });
    it("Should revert if a non-tenant tries to check in", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2);

      

      await expect(
        rentdapp.connect(addr1).checkInApartment(apartmentId, bookingId, deadline, v, r, s)
      ).to.be.revertedWith("Unauthorized Entity");
    });

    it("Should revert if the booking is already checked in", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2);
      

      // First check-in
      await rentdapp.connect(addr2).checkInApartment(apartmentId, bookingId, deadline, v, r, s);

      // Attempt a second check-in
      await expect(
        rentdapp.connect(addr2).checkInApartment(apartmentId, bookingId, deadline, v, r, s)
      ).to.be.revertedWith("Already checked in");
    });


  });


  describe("checkOutApartment", function () {
    it("Should allow a tenant to check out of an apartment", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2) 
      await rentdapp.connect(addr2).checkInApartment(apartmentId, bookingId, deadline, v, r, s);
      await rentdapp.connect(addr2).checkOutApartment(apartmentId, bookingId, deadline, v, r, s);
      const booking = await rentdapp.bookings(bookingId);
      expect(booking.checkedOut).to.be.true;
    });
    it("Should revert if the booking is not found", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)
      await expect(
        rentdapp.connect(addr2).checkOutApartment(apartmentId, 999,deadline, v, r, s)
      ).to.be.revertedWith("Booking not found");
    });
    it("Should revert if the apartment is not found", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)
      await expect(
        rentdapp.connect(addr2).checkOutApartment(999, bookingId,deadline, v, r, s)
      ).to.be.revertedWith("Apartment not found");
    });
    it("Should revert if the caller is not the tenant", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)
      
      await rentdapp.connect(addr2).checkInApartment(apartmentId, bookingId, deadline, v, r, s);
      await expect(
        rentdapp.connect(addr1).checkOutApartment(apartmentId, bookingId)
      ).to.be.revertedWith("Caller is not the tenant");
    });
   
    
  });

  describe("Successful Cancellation", function () {
    it("Should allow tenant to cancel before booking date starts", async function () {
      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);

      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)
      

      await rentdapp.connect(addr2).cancelBooking(apartmentId, bookingId, deadline, v, r, s)
     

      const booking = await rentdapp.bookingsOf(apartmentId, bookingId);
      expect(booking.cancelled).to.be.true;

      // Verify booked date is cleared
      expect(await rentdapp.isDateBooked(apartmentId, booking.date)).to.be.false;

      // Verify collateral refund
      expect(await ethers.provider.getBalance(tenant.address)).to.be.above(ethers.utils.parseEther("50"));

      // Verify commission and utility payments
      const contractBalance = await permitToken.balanceOf(rentdapp.address);
      expect(contractBalance).to.equal(utilityFee);
    });

    

    it("Should revert if booking is already checked in", async function () {

      const { rentdapp, permitToken, owner, addr1, addr2, v, r, s } = await loadFixture(deployRentappFixture);
      const { v2, r2, s2 } = await generatePermitSignature(addr2);

      const purchaseAmount = ethers.utils.parseEther("1"); // 1 Ether
      const tokenPrice = 100; // 1 ETH = 100 tokens (as per MyToken contract)

      // addr1 purchases tokens
      await permitToken.connect(addr1).buyTokens({ value: purchaseAmount });
      await permitToken.connect(addr2).buyTokens({ value: purchaseAmount });

      // Verify addr1 received tokens
      const addr1Balance = await permitToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(purchaseAmount.mul(tokenPrice));

      // Verify addr2 received tokens
      const addr2Balance = await permitToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(purchaseAmount.mul(tokenPrice));
      
      // Create an apartment

      await rentdapp.connect(addr1).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      const amount = price * dates.length 

      await rentdapp.connect(addr2).bookApartment(id, dates, deadline, v2, r2, s2)

      // Check in the booking
      await rentdapp.connect(addr2).checkInApartment(apartmentId, bookingId, deadline, v, r, s);

      await expect(
        rentdapp.connect(addr2).cancelBooking(apartmentId, bookingId, deadline, v, r, s)
      ).to.be.revertedWith("Already checked in");
    });

    
  });
  


  

  
});

  
  

  
  


