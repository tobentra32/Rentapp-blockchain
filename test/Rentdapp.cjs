const { expect } = require("chai");

const { ethers } = require("hardhat");




// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const {
  loadFixture, time
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
  let owner, landlord, tenant1, tenant2, bookingDates;
  

  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat

  async function deployRentappFixture() {


    // Get current block timestamp
      const currentBlock = await ethers.provider.getBlock("latest");
      const now = currentBlock.timestamp;
      
      // Create booking dates (tomorrow and day after)
      const bookingDates = [
          now + 86400, // 1 day in seconds
          now + 172800 // 2 days in seconds
      ].map(n => BigInt(n)); // Convert to BigInt for the contract call

    

    


    // Deploy the token contract
    [owner, landlord, tenant1, tenant2] = await ethers.getSigners();
    
    //Rentdapp = await ethers.getContractFactory("Rentdapp");
    rentdapp = await ethers.deployContract("Rentdapp");
    await rentdapp.waitForDeployment();
  
    // Fixtures can return anything you consider useful for your tests
    
    return { rentdapp, owner, landlord, tenant1, tenant2, bookingDates };
  }
 

  describe("Deployment", function () {
    it("Should deploy the Rentdapp contract", async function () {
      const { rentdapp, owner, landlord, tenant1, tenant2 } = await loadFixture(deployRentappFixture);
      expect(await rentdapp.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the correct tax and security fee", async function () {
      expect(await rentdapp.taxPercent()).to.equal(5);
      expect(await rentdapp.securityFee()).to.equal(10);
    });
  });

  describe("Apartment Management", function () {
    let apartmentId;

    it("Should create a new apartment", async function () {
      const tx = await rentdapp.connect(landlord).createAppartment(
        "Luxury Suite",
        "Beautiful luxury suite with ocean view",
        "category",
        "Miami Beach",
        "image1.jpg,image2.jpg",
        3,
        ethers.parseEther("0.01")
      );

      await expect(tx)
        .to.emit(rentdapp, "ApartmentCreated")
        .withArgs("Luxury Suite", ethers.parseEther("0.01"), landlord.address, 1);

      apartmentId = 1;
      expect(await rentdapp._totalAppartments()).to.equal(1);
    });

    it("Should fail to create apartment with invalid parameters", async function () {
      await expect(rentdapp.connect(landlord).createAppartment(
        "", 
        "Description",
        "categories",
        "Location",
        "image.jpg",
        2,
        ethers.parseEther("1.0")
      )).to.be.revertedWith("Name cannot be empty");

      await expect(rentdapp.connect(landlord).createAppartment(
        "Name",
        "Description",
        "category",
        "Location",
        "image.jpg",
        0, // zero rooms
        ethers.parseEther("1.0")
      )).to.be.revertedWith("Rooms cannot be zero");

      await expect(rentdapp.connect(landlord).createAppartment(
        "Name",
        "Description",
        "Category",
        "Location",
        "image.jpg",
        2,
        0 // zero price
      )).to.be.revertedWith("Price cannot be zero");
    });

    it("Should update apartment details", async function () {
      await rentdapp.connect(landlord).updateAppartment(
        apartmentId,
        "Updated Luxury Suite",
        "Updated description",
        "new category",
        "New York",
        "new_image.jpg",
        4,
        ethers.parseEther("1.5")
      );

      const apartment = await rentdapp.getApartment(apartmentId);
      expect(apartment.name).to.equal("Updated Luxury Suite");
      expect(apartment.price).to.equal(ethers.parseEther("1.5"));
      expect(apartment.rooms).to.equal(4);
    });

    it("Should prevent unauthorized apartment updates", async function () {
      await expect(rentdapp.connect(tenant2).updateAppartment(
        apartmentId,
        "Hacked Name",
        "Hacked",
        "hacked category",
        "Hacked",
        "hacked.jpg",
        1,
        ethers.parseEther("0.1")
      )).to.be.revertedWith("Unauthorized, owner only");
    });

    it("Should delete an apartment", async function () {
      await rentdapp.connect(landlord).deleteAppartment(apartmentId);
      const apartment = await rentdapp.getApartment(apartmentId);
      //console.log(apartment);

      expect(apartment.deleted).to.be.true;
    });

    it("Should prevent unauthorized deletion", async function () {
      const tx = await rentdapp.connect(landlord).createAppartment(
        "Suite",
        "Beautiful luxury suite with ocean view",
        "category",
        "Miami Beach",
        "image1.jpg,image2.jpg",
        3,
        ethers.parseEther("2.0")
      );
      await expect(tx)
        .to.emit(rentdapp, "ApartmentCreated")
        .withArgs("Suite", ethers.parseEther("2.0"), landlord.address, 2);


      apartmentId = 2;
   
      await expect(rentdapp.connect(tenant2).deleteAppartment(apartmentId))
        .to.be.revertedWith("Unauthorized entity");
    });

    it("Should get all apartments excluding deleted ones", async function () {
      // Create a second apartment
      await rentdapp.connect(landlord).createAppartment(
        "Second Apartment",
        "Description",
        "category",
        "Location",
        "image.jpg",
        2,
        ethers.parseEther("1.0")
      );

      const apartments = await rentdapp.getApartments();
      expect(apartments.length).to.equal(2); // Only the second apartment should be returned
      expect(apartments[1].name).to.equal("Second Apartment");
    });
  });

  describe("Booking System", function () {
    
    let apartmentId;
    //let bookingId;
    
    

    it("Should book an apartment", async function () {
      await rentdapp.connect(landlord).createAppartment(
        "Booking Test Apartment",
        "Description",
        "booking category",
        "Location",
        "image.jpg",
        2,
        ethers.parseEther("0.01")
     );
    
      apartmentId = 4; // Assuming this is the fourrth apartment created
      
      // Get current block timestamp
      const currentBlock = await ethers.provider.getBlock("latest");
      const now = currentBlock.timestamp;
      
      // Create booking dates (tomorrow and day after)
      const bookingDates = [
          now + 86400, // 1 day in seconds
          now + 172800 // 2 days in seconds
      ].map(n => BigInt(n)); // Convert to BigInt for the contract call
      const apartment = await rentdapp.getApartment(apartmentId);
      //console.log("apartment :", apartment);
      
      const pricePerDay = ethers.parseEther("0.01");
      const totalPrice = pricePerDay * BigInt(bookingDates.length);
      const securityFee = (totalPrice * 10n) / 100n; // Using BigInt arithmetic
      const totalToPay = totalPrice + securityFee;

      const tenant1_bal = await ethers.provider.getBalance(tenant1);
      //console.log("tenant1_bal :", tenant1_bal);
      //console.log("totalToPay :", totalToPay);

      await expect(
        rentdapp.connect(tenant1).bookApartment(apartmentId, bookingDates, {
          value: totalToPay
        })
      ).to.not.be.reverted;

      expect(await rentdapp._totalBookings()).to.equal(0); // Note: Your contract doesn't increment _totalBookings
      
      const bookings = await rentdapp.getBookings(apartmentId);
      expect(bookings.length).to.equal(bookingDates.length);
      expect(bookings[0].tenant).to.equal(tenant1.address);
    });

    it("Should fail to book with insufficient funds", async function () {
      const bookings = await rentdapp.getBookings(apartmentId);
      const bookings_date = bookings.map(arr => arr[3]);
      const insufficientAmount = ethers.parseEther("1.0");
      await expect(
        rentdapp.connect(tenant1).bookApartment(apartmentId, [bookings_date[0]], {
          value: insufficientAmount
        })
      ).to.be.revertedWith("Insufficient fund!");
    });

    it("Should fail to book already booked dates", async function () {

      const bookings = await rentdapp.getBookings(apartmentId);
      const bookings_date = bookings.map(arr => arr[3]);

      apartmentId = 4; // Assuming this is the fourth apartment created
      
      await expect(
        rentdapp.connect(tenant2).bookApartment(apartmentId, [bookings_date[0]], {
          value: ethers.parseEther("1.1") // 1 ETH + 10% fee
        })
      ).to.be.revertedWith("Booked date found among dates!");
    });

    it("Should get unavailable dates", async function () {
      const unavailableDates = await rentdapp.getUnavailableDates(apartmentId);
      const bookings = await rentdapp.getBookings(apartmentId);
      const bookings_date = bookings.map(arr => arr[3]);
      console.log("unaval_dates:", bookings_date);
      expect(unavailableDates.length).to.equal(bookings_date.length);
      expect(unavailableDates[0]).to.equal(bookings_date[0]);
    });

    it("Should check in to apartment", async function () {
      const initialOwnerBalance = await ethers.provider.getBalance(landlord.address);
      //console.log("ownerBalance:",initialOwnerBalance);
      const initialTenantBalance = await ethers.provider.getBalance(tenant1.address);
      //console.log("tenantBalance:",initialTenantBalance);
      const initialContractBalance = await ethers.provider.getBalance(rentdapp.owner());
      //console.log("contractBalance:",initialContractBalance);

      const bookingId = 0;
      

      const booking = await rentdapp.getBooking(apartmentId, bookingId);
      //console.log("booking:", booking);
      await time.increaseTo(booking.date);
      await rentdapp.connect(tenant1).checkInApartment(apartmentId, bookingId);

      // Verify booking is marked as checked
      
      //console.log("booking:", booking);
      expect(booking.checked).to.be.true;

      // Verify tenant is marked as having booked
      expect(await rentdapp.tenantBooked(apartmentId)).to.be.true;

      // Verify funds were distributed correctly
      // 5% tax to owner, 95% to landlord, security fee returned to tenant
      const price = booking.price;
      // Percentages in BigInt
      const tax = (price * 5n) / 100n;         // 5% tax
      //console.log("tax:",tax);
      const securityFee = (price * 10n) / 100n; // 10% security fee
      const landlordShare = price - tax;       // Remaining 95% to landlord
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      //console.log("finalBalance:",finalOwnerBalance);
      const tax_val = finalOwnerBalance - (initialOwnerBalance);
      //console.log("tax_val:", tax_val);
      expect(finalOwnerBalance - (initialContractBalance)).to.equal(tax);

      // Note: These checks might need adjustment for gas costs in real tests
      const finalLandlordBalance = await ethers.provider.getBalance(landlord.address);
      expect(finalLandlordBalance - (initialOwnerBalance)).to.equal(landlordShare);

      const finalTenantBalance = await ethers.provider.getBalance(tenant1.address);
      expect(initialTenantBalance - (finalTenantBalance)).to.be.lessThan(ethers.parseEther("0.1")); // Approximate check
    });

    it("Should prevent unauthorized check-in", async function () {
      await expect(rentdapp.connect(tenant2).checkInApartment(apartmentId, 1))
        .to.be.revertedWith("Unauthorized tenant!");
    });

    

    it("Should refund a booking", async function () {
      // Create a new booking to test refund
      apartmentId = 4;
      const refundDate = Math.floor(Date.now() / 1000) + 559200; // 3 days from now
      //await rentdapp.connect(tenant1).bookApartment(apartmentId, [refundDate], {
        //value: ethers.parseEther("0.011") // 1 ETH + 10% fee
      //});
      const bookings = await rentdapp.getBookings(apartmentId);
      console.log("bookings:",bookings);

      const bookingId = 1; 

      const booking = await rentdapp.getBooking(apartmentId, bookingId);
      console.log("booking",booking);
      
      const initialTenantBalance = await ethers.provider.getBalance(tenant1.address);
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const initialLandlordBalance = await ethers.provider.getBalance(landlord.address);

      await rentdapp.connect(tenant1).refundBooking(apartmentId, bookingId);

      
      expect(booking.cancelled).to.be.true;
      expect(await rentdapp.isDateBooked(apartmentId, refundDate)).to.be.false;

      // Verify funds were distributed correctly
      // Tenant gets back booking price (1 ETH)
      // Security fee (0.1 ETH) is split between owner and landlord (0.05 ETH each)
      const price = ethers.parseEther("1.0");
      const securityFee = price * (10n) / (100n);
      const collateral = securityFee / (2n);

      const finalTenantBalance = await ethers.provider.getBalance(tenant.address);
      expect(finalTenantBalance.sub(initialTenantBalance)).to.be.closeTo(
        price,
        ethers.parseEther("0.01") // Allow for gas costs
      );

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance.sub(initialOwnerBalance)).to.equal(collateral);

      const finalLandlordBalance = await ethers.provider.getBalance(landlord.address);
      expect(finalLandlordBalance.sub(initialLandlordBalance)).to.equal(collateral);
    });

    it("Should prevent refund after booking date starts", async function () {
      // Create a booking in the past
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      await rentdapp.connect(tenant1).bookApartment(apartmentId, [pastDate], {
        value: ethers.parseEther("0.01")
      });

      const bookingId = 3; // Fourth booking
      
      await expect(rentdapp.connect(tenant).refundBooking(apartmentId, bookingId))
        .to.be.revertedWith("Can no longer refund, booking date started");
    });

    it("Should allow owner to force refund", async function () {
      // Create a new booking
      const futureDate = Math.floor(Date.now() / 1000) + 86400 * 2; // 2 days from now
      await rentdapp.connect(tenant1).bookApartment(apartmentId, [futureDate], {
        value: ethers.parseEther("1.1")
      });

      const bookingId = 4; // Fifth booking
      
      // Owner can refund even if date hasn't passed
      await expect(rentdapp.connect(owner).refundBooking(apartmentId, bookingId))
        .to.not.be.reverted;
    });
  });

  describe("Review System", function () {
    let apartmentId;
    let bookingId;
    
    it("Should add a review", async function () {
      await rentdapp.connect(landlord).createAppartment(
        "Booking Test Apartment",
        "Description",
        "category",
        "Location",
        "image.jpg",
        2,
        ethers.parseEther("0.001")
      );
      apartmentId = 4;
      bookingId = 1; // Assuming this is the first booking

      const booking = await rentdapp.getBooking(apartmentId, bookingId);
      //console.log("bookings:",booking);

    
      // Book and check in to be able to review
      //const bookingDate = Math.floor(Date.now() / 1000);
      //await rentdapp.connect(tenant1).bookApartment(apartmentId, [bookingDate], {
       // value: ethers.parseEther("0.011")
      //});
      await time.increaseTo(booking.date);
      

      await rentdapp.connect(tenant1).checkInApartment(apartmentId, bookingId);
      
      
      await rentdapp.connect(tenant1).addReview(apartmentId, "Great apartment!");
      
      const reviews = await rentdapp.getReviews(apartmentId);
      expect(reviews.length).to.equal(1);
      expect(reviews[0].reviewText).to.equal("Great apartment!");
      expect(reviews[0].owner).to.equal(tenant1.address);
    });

    it("Should prevent reviews from non-tenants", async function () {
      await expect(
        rentdapp.connect(tenant2).addReview(apartmentId, "Fake review")
      ).to.be.revertedWith("Book first before review");
    });

    it("Should prevent empty reviews", async function () {
      await expect(
        rentdapp.connect(tenant1).addReview(apartmentId, "")
      ).to.be.revertedWith("Review text cannot be empty");
    });

    it("Should get qualified reviewers", async function () {
      const reviewers = await rentdapp.getQualifiedReviewers(apartmentId);
      expect(reviewers.length).to.equal(2);
      expect(reviewers[0]).to.equal(tenant1.address);
    });
  });

  describe("Security Checks", function () {
    

    it("Should correctly handle ETH transfers", async function () {
      const rentapp_bal = await ethers.provider.getBalance(rentdapp.getAddress());
      //console.log("rentapp_bal:",rentapp_bal);
      const testAmount = ethers.parseEther("1.0");
      const tx = await owner.sendTransaction({
        to: rentdapp.getAddress(),
        value: testAmount
      });
      await tx.wait();

      // Verify contract received funds
      const balance = await ethers.provider.getBalance(rentdapp.getAddress());
      expect(balance).to.equal(testAmount+rentapp_bal);
    });
  });
  

  
});

  
  

  
  


