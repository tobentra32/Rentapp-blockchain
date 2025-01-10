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
  const utilityFee = ethers.utils.parseEther("0.0016");
  const initialAllowance = ethers.utils.parseEther("999999");
  const id = 1
  const bookingId = 0
  const taxPercent = 7
  const securityFee = 5
  const name = 'First apartment'
  const location = 'PHC'
  const newName = 'Update apartment'
  const description = 'Lorem Ipsum dalum'
  const images = [
    'https://a0.muscache.com/im/pictures/miso/Hosting-3524556/original/24e9b114-7db5-4fab-8994-bc16f263ad1d.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-5264493/original/10d2c21f-84c2-46c5-b20b-b51d1c2c971a.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/prohost-api/Hosting-584469386220279136/original/227d4c26-43d5-42da-ad84-d039515c0bad.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-610511843622686196/original/253bfa1e-8c53-4dc0-a3af-0a75728c0708.jpeg?im_w=720',
    'https://a0.muscache.com/im/pictures/miso/Hosting-535385560957380751/original/90cc1db6-d31c-48d5-80e8-47259e750d30.jpeg?im_w=720',
  ]
  const rooms = 4
  const price = 2.7
  const newPrice = 1.3

  
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat

  async function deployRentappFixture() {


    // Deploy mock token with permit functionality
    const MockPermitToken = await ethers.getContractFactory("MockPermitToken");
    permitToken = await MockPermitToken.deploy("Permit Token", "PTKN");
    await permitToken.deployed();

    // Get the Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    rentdapp = await ethers.deployContract("Rentdapp");

    await rentdapp.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { rentdapp, permitToken, owner, addr1, addr2};
  }
  // Network to that snapshot in every test.

  it("Should set the correct owner and utility fee", async function () {
    // We use loadFixture to setup our environment, and then assert that things went well
    const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
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

    const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);

    it('Should create an apartment successfully', async () => {

      const tx = await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);

      const receipt = await tx.wait();
      await expect(tx).to.emit(rentdapp, "ApartmentCreated").withArgs(
        "Apartment 1",
        ethers.utils.parseEther("1"),
        owner.address,
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
      await expect(
        rentdapp.createApartment(
          "",
          "A nice place",
          "Downtown",
          "image.jpg",
          3,
          ethers.utils.parseEther("1"),
          Math.floor(Date.now() / 1000) + 3600, // deadline
          0, // v
          ethers.utils.keccak256("0x1234"), // r
          ethers.utils.keccak256("0x5678") // s
        )
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Update Apartment", function () {
    
    
    
    it('Should confirm apartment update', async () => {

      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      const tx = await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      const receipt = await tx.wait();

      result = await rentdapp.getApartment(id)
      expect(result.name).to.be.equal(name)
      expect(result.price).to.be.equal(toWei(price))
    
      await rentdapp.connect(owner).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s)
    
      result = await contract.getApartment(id)
      expect(result.name).to.be.equal(newName)
      expect(result.price).to.be.equal(toWei(newPrice))
    });

    it("Should revert if unauthorized user attempts to update", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);

      await rentdapp.connect(addr1).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s).to.be.revertedWith("Unauthorized entity");
    });

    it("Should revert if apartment does not exist", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(owner).updateAppartment(999,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, v, r, s).to.be.revertedWith("Apartment does not exist");
    });
    it("Should revert if deadline has passed", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(owner).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , Math.floor(Date.now() / 1000) - 3600, v, r, s).to.be.revertedWith("Deadline has passed");
    });
    it("Should revert if signature is invalid", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      await rentdapp.connect(owner).updateAppartment(id,newName,description,location,images.join(','),rooms,toWei(newPrice) , deadline, 1, r, s).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Delete Apartment", function () {
    

    it("Should delete an apartment successfully", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      await rentdapp.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      result = await rentdapp.getApartments();
      expect(result).to.have.lengthOf(1);
      result = await rentdapp.getApartment(id);
      expect(result.deleted).to.be.equal(false)    
      await rentdapp.connect(owner).deleteApartment(id, deadline, v, r, s);
      result = await contract.getApartments()
      expect(result).to.have.lengthOf(0)
      const apartment = await rentdapp.getApartment(id);
      expect(apartment.deleted).to.equal(true);
    });
    
    it("Should revert if unauthorized user attempts to delete", async function () {
      await rentdapp.connect(addr1).deleteApartment(id, deadline, v, r, s).to.be.revertedWith("Unauthorized entity");
    });
  });

  describe("Booking Functions", function () {
    it("Should book an apartment", async function () {
      const { rentdapp, owner, addr1, addr2 } = await loadFixture(deployRentappFixture);
      // Create an apartment

      await contract.connect(owner).createAppartment(name, description, location, images.join(','), rooms, toWei(price), deadline, v, r, s);
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      await rentdapp.bookApartment(
        id,
        dates,
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );

      result = await rentdapp.getBookings(id)
      expect(result).to.have.lengthOf(dates.length)

      result = await contract.getUnavailableDates(id)
      expect(result).to.have.lengthOf(dates.length)
      // Check if the apartment is booked
      const booking = await rentdapp.getBooking(id, dates[0]);
      expect(booking.booked).to.equal(true);
    });
    it('Should confirm qualified reviewers', async () => {
      result = await contract.getQualifiedReviewers(id)
      expect(result).to.have.lengthOf(0)

      await contract.connect(tenant1).checkInApartment(id, 1)

      result = await contract.getQualifiedReviewers(id)
      expect(result).to.have.lengthOf(1)
    })

    it('Should confirm apartment checking in', async () => {
      result = await contract.getBooking(id, bookingId)
      expect(result.checked).to.be.equal(false)

      result = await contract.connect(tenant1).tenantBooked(id)
      expect(result).to.be.equal(false)

      await contract.connect(tenant1).checkInApartment(id, bookingId)

      result = await contract.getBooking(id, bookingId)
      expect(result.checked).to.be.equal(true)

      result = await contract.connect(tenant1).tenantBooked(id)
      expect(result).to.be.equal(true)
    })

    it('Should confirm apartment refund', async () => {
      result = await contract.getBooking(id, bookingId)
      expect(result.cancelled).to.be.equal(false)

      await contract.connect(tenant1).refundBooking(id, bookingId)

      result = await contract.getBooking(id, bookingId)
      expect(result.cancelled).to.be.equal(true)
    })

    it('Should return the security fee', async () => {
      result = await contract.securityFee()
      expect(result).to.be.equal(securityFee)
    })

    it('Should return the tax percent', async () => {
      result = await contract.taxPercent()
      expect(result).to.be.equal(taxPercent)
    })

    it('Should prevent booking with wrong id', async () => {
      const amount = price * dates1.length + (price * dates1.length * securityFee) / 100
      await expect(
        contract.connect(tenant1).bookApartment(666, dates1, {
          value: toWei(amount),
        })
      ).to.be.revertedWith('Apartment not found!')
    })

    it('Should prevent booking with wrong pricing', async () => {
      await expect(
        contract.connect(tenant1).bookApartment(id, dates1, {
          value: toWei(price * 0 + securityFee),
        })
      ).to.be.revertedWith('Insufficient fund!')
    })








    it("Should revert if the apartment is already booked", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      await rentdapp.bookApartment(
        1,
        dates,
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment again
      await expect(
        rentdapp.bookApartment(
          1,
          dates,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Apartment already booked");
    });
    it("Should revert if the booking period is invalid", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment with an invalid booking period
      const dates = [Math.floor(Date.now() / 1000) - 86400];
      await expect(
        rentdapp.bookApartment(
          1,
          dates,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Invalid booking period");
    });
    it("Should revert if the booking period is too long", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment with a booking period that is too long
      const dates = [
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 172800,
      ];
      await expect(
        rentdapp.bookApartment(
          1,
          dates,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Booking period too long");
    });
    it("Should revert if the booking period overlaps with an existing booking", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Book the apartment
      const dates1 = [Math.floor(Date.now() / 1000) + 86400];
      await rentdapp.bookApartment(
        1,
        dates1,
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment with a booking period that overlaps with the existing booking
      const dates2 = [
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 172800,
      ];
      await expect(
        rentdapp.bookApartment(
          1,
          dates2,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Booking period overlaps with existing booking");
    });
    it("Should revert if the booking period is in the past", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment with a booking period in the past
      const dates = [
        Math.floor(Date.now() / 1000) - 172800,
        Math.floor(Date.now() / 1000) - 86400,
      ];
      await expect(
        rentdapp.bookApartment(
          1,
          dates,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Booking period is in the past");
    });
    it("Should revert if the booking period is not consecutive", async function () {
      // Create an apartment
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );
      // Try to book the apartment with a booking period that is not consecutive
      const dates = [
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 172800,
        Math.floor(Date.now() / 1000) + 259200,
      ];
      await expect(
        rentdapp.bookApartment(
          1,
          dates,
          Math.floor(Date.now() / 1000) + 3600,
          0,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("Booking period is not consecutive");
    });
    
    it("Should revert if the booking period is not within the availability period", async function () {
      // Create an apartment
      await rentdapp.createApartment(
      const amount = price * dates1.length + (price * dates1.length * securityFee) / 100
      await contract.connect(tenant1).bookApartment(id, dates1, {
          value: toWei(amount),
      })
      await rentdapp.createApartment(
        "Apartment",
        "Description",
        "Location",
        "Images",
        2,
        ethers.utils.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );

      // Book the apartment
      const dates = [Math.floor(Date.now() / 1000) + 86400];
      await rentdapp.bookApartment(
        1,
        dates,
        Math.floor(Date.now() / 1000) + 3600,
        0,
        ethers.constants.HashZero,
        ethers.constants.HashZero
      );

      const bookings = await rentdapp.getBookings(1);
      expect(bookings.length).to.equal(1);
      expect(bookings[0].tenant).to.equal(owner.address);
    });

    it("Should cancel a booking", async function () {
      // Additional test for cancelBooking
    });

    it("Should handle check-in and check-out", async function () {
      // Additional test for checkInApartment and checkOutApartment
    });
  });

  
  

  
  



});