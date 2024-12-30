// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

interface ITokenA {
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}


contract Rentdapp is Ownable, ReentrancyGuard {

  TokenA public token;

  struct ApartmentStruct {
    uint id;
    string name;
    string description;
    string location;
    string images;
    uint rooms;
    uint price;
    address owner;
    bool booked;
    bool deleted;
    uint timestamp;
  }

  event ApartmentCreated(
      uint256 id,
      string name,
      string description,
      string location,
      uint256 rooms,
      uint256 price,
      address owner,
      uint256 timestamp
  );

  // Event to emit when an apartment is updated
  event ApartmentUpdated(
      uint256 id,
      string name,
      string description,
      string location,
      uint256 rooms,
      uint256 price,
      address owner,
      uint256 timestamp
  );

  event ApartmentDeleted(
      uint256 id,
      string name,
      string description,
      string location,
      uint256 rooms,
      uint256 price,
      address owner,
      uint256 timestamp
  );

  struct BookingStruct {
    uint id;
    uint aid;
    address tenant;
    uint date;
    uint price;
    bool checked;
    bool cancelled;
  }

  struct ReviewStruct {
    uint id;
    uint aid;
    string reviewText;
    uint timestamp;
    address owner;
  }

  address public owner;



  uint256 public _totalAppartments;
  uint256 public _totalBookings;

  uint public securityFee;
  uint public taxPercent;

  mapping(uint => ApartmentStruct) apartments;
  mapping(uint => BookingStruct[]) bookingsOf;
  mapping(uint => ReviewStruct[]) reviewsOf;
  mapping(uint => bool) appartmentExist;
  mapping(uint => uint[]) bookedDates;
  mapping(uint => mapping(uint => bool)) isDateBooked;
  mapping(address => mapping(uint => bool)) hasBooked;

  constructor(uint _taxPercent, uint _securityFee, address _tokenAddress) {
    token = TokenA(_tokenAddress)
    taxPercent = _taxPercent;
    securityFee = _securityFee;
  }

  modifier onlyOwner() {
      require(msg.sender == owner, "Not the owner");
      _;
  }


  function createApartment(
    string memory name,
    string memory description,
    string memory location,
    string memory images,
    uint rooms,
    uint price
  ) public {
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(bytes(location).length > 0, 'Location cannot be empty');
    require(bytes(images).length > 0, 'Images cannot be empty');
    require(rooms > 0, 'Rooms cannot be zero');
    require(price > 0 ether, 'Price cannot be zero');
    require(token.allowance(msg.sender, address(this)) >= applicationFee, "Allowance too low");
    require(token.transferFrom(msg.sender, address(this), applicationFee), "Payment failed");


    ++_totalAppartments;
    ApartmentStruct memory apartment;

    apartment.id = _totalAppartments;
    apartment.name = name;
    apartment.description = description;
    apartment.location = location;
    apartment.images = images;
    apartment.rooms = rooms;
    apartment.price = price;
    apartment.owner = msg.sender;
    apartment.timestamp = currentTime();

    appartmentExist[apartment.id] = true;
    apartments[apartment.id] = apartment;

    // Emit the ApartmentCreated event
    emit ApartmentCreated(
        apartment.id,
        apartment.name,
        apartment.description,
        apartment.location,
        apartment.rooms,
        apartment.price,
        apartment.owner,
        apartment.timestamp
    );
  }

  function updateApartment(
    uint id,
    string memory name,
    string memory description,
    string memory location,
    string memory images,
    uint rooms,
    uint price
  ) public {
    require(appartmentExist[id], 'Appartment not found');
    require(msg.sender == apartments[id].owner, 'Unauthorized entity');
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(bytes(location).length > 0, 'Location cannot be empty');
    require(bytes(images).length > 0, 'Images cannot be empty');
    require(rooms > 0, 'Rooms cannot be zero');
    require(price > 0 ether, 'Price cannot be zero');

    ApartmentStruct memory apartment = apartments[id];
    apartment.name = name;
    apartment.description = description;
    apartment.location = location;
    apartment.images = images;
    apartment.rooms = rooms;
    apartment.price = price;

    apartments[apartment.id] = apartment;

    // Emit the ApartmentUpdated event
    emit ApartmentUpdated(
        apartment.id,
        apartment.name,
        apartment.description,
        apartment.location,
        apartment.images,
        apartment.rooms,
        apartment.price,
        apartment.owner,
        apartment.timestamp
    );
  }

  function deleteApartment(uint id) public {
    require(appartmentExist[id], 'Appartment not found');
    require(msg.sender == apartments[id].owner, 'Unauthorized entity');

    appartmentExist[id] = false;
    apartments[id].deleted = true;

    // Emit the ApartmentDeleted event
    ApartmentStruct memory apartment = apartments[id];
    emit ApartmentDeleted(
        apartment.id,
        apartment.name,
        apartment.description,
        apartment.location,
        apartment.rooms,
        apartment.price,
        apartment.owner,
        apartment.timestamp
    );
  }

  function getApartment(uint id) public view returns (ApartmentStruct memory) {
    return apartments[id];

  }

  function getApartments() public view returns (ApartmentStruct[] memory Apartments, uint256 total_appartment_aval ) {
    uint256 available;


    for (uint i = 1; i <= _totalAppartments; i++)
    // Iterate through all the apartments, checks out for the ones that are not deleted
    for (uint i = 1; i <= _totalAppartments; i++) {
      if (!apartments[i].deleted) available++;
    }
    // Allocate memory for the apartments: create an array of the size of the available apartments that are not deleted
    Apartments = new ApartmentStruct[](available);

    uint256 index;
    for (uint i = 1; i <= _totalAppartments; i++) {
      if (!apartments[i].deleted) {

        // Assign the apartment to the array
        Apartments[index++] = apartments[i];
      }
    }

    uint256 total_appartment_ aval = Apartments.length;
  }

  function getApartmentCount() public view returns (uint256){
    return _totalAppartments;
  }



  function bookApartment(uint aid, uint[] memory dates) public payable {
    uint totalPrice = apartments[aid].price * dates.length;
    uint totalSecurityFee = (totalPrice * securityFee) / 100;

    require(appartmentExist[aid], 'Apartment not found!');
    require(msg.value >= (totalPrice + totalSecurityFee), 'Insufficient fund');
    require(datasCleared(aid, dates), 'One or more dates not available');

    for (uint i = 0; i < dates.length; i++) {
      BookingStruct memory booking;
      booking.id = bookingsOf[aid].length;
      booking.aid = aid;
      booking.tenant = msg.sender;
      booking.date = dates[i];
      booking.price = apartments[aid].price;

      bookingsOf[aid].push(booking);
      bookedDates[aid].push(dates[i]);
      isDateBooked[aid][dates[i]] = true;
    }
  }
  function cancelBooking(uint bid) public {
    require


  function withdrawFees() public onlyOwner {
      uint256 balance = token.balanceOf(address(this));
      require(balance > 0, "No tokens to withdraw");
      require(token.transfer(owner, balance), "Withdraw failed");
  }







}