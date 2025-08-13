// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./MathLibrary.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Rentdapp is Ownable, ReentrancyGuard {

  using MathLibrary for uint256;
  
  struct ApartmentStruct {
    uint id;                
    address owner;          
    uint timestamp;         
    uint price;             
    uint rooms;             
    bool booked;            
    bool deleted;           
    string name;            
    string description;     
    string location;         
    string images;          
    string category;        
}

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
 
  uint public constant securityFee = 10; // 10%
  uint public constant taxPercent = 5;   // 5%

  event ApartmentCreated(
    string indexed name,
    uint256 indexed price,
    address indexed owner,
    uint256 id  
);
  // Event to emit when an apartment is updated
  event ApartmentUpdated(
      string indexed name,
      uint256 indexed price,
      address indexed owner
  );

  uint public _totalAppartments;
  uint public _totalBookings;

  mapping(uint => ApartmentStruct) apartments;
  mapping(uint => BookingStruct[]) bookingsOf;
  mapping(uint => ReviewStruct[]) reviewsOf;
  mapping(uint => bool) appartmentExist;
  mapping(uint => uint[]) bookedDates;
  mapping(uint => mapping(uint => bool)) isDateBooked;
  mapping(address => mapping(uint => bool)) hasBooked;


  constructor() Ownable(msg.sender) {
    
  }


  function createAppartment(
    string memory name,
    string memory description,
    string memory category,
    string memory location,
    string memory images,
    uint rooms,
    uint price
  ) public {
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(bytes(category).length > 0, 'Catogory cannot be empty');
    require(bytes(location).length > 0, 'Location cannot be empty');
    require(bytes(images).length > 0, 'Images cannot be empty');
    require(rooms > 0, 'Rooms cannot be zero');
    require(price > 0 ether, 'Price cannot be zero');

    _totalAppartments++;
    apartments[_totalAppartments] = ApartmentStruct({
      id: _totalAppartments,
      owner: msg.sender,
      timestamp: block.timestamp,
      price: price,
      rooms: rooms,
      booked: false,
      deleted: false,
      name: name,
      description: description,
      location: location,
      images: images,
      category: category
    });

    appartmentExist[_totalAppartments] = true;
    
    emit ApartmentCreated(name, price, msg.sender, _totalAppartments);

  }

  function updateAppartment(
    uint id,
    string memory name,
    string memory description,
    string memory category,
    string memory location,
    string memory images,
    uint rooms,
    uint price
  ) public {
      require(appartmentExist[id], 'Appartment not found');
      require(msg.sender == apartments[id].owner, 'Unauthorized, owner only');
      
      // Only validate changed parameters
      if (bytes(name).length > 0) {
          apartments[id].name = name;
      } else {
          require(bytes(apartments[id].name).length > 0, 'Name cannot be empty');
      }
      
      if (bytes(description).length > 0) {
          apartments[id].description = description;
      } else {
          require(bytes(apartments[id].description).length > 0, 'Description cannot be empty');
      }

      if (bytes(category).length > 0) {
          apartments[id].category = category;
      } else {
          require(bytes(apartments[id].category).length > 0, 'Category cannot be empty');
      }
      
      if (bytes(location).length > 0) {
          apartments[id].location = location;
      } else {
          require(bytes(apartments[id].location).length > 0, 'Location cannot be empty');
      }
      
      if (bytes(images).length > 0) {
          apartments[id].images = images;
      } else {
          require(bytes(apartments[id].images).length > 0, 'Images cannot be empty');
      }
      
      if (rooms > 0) {
          apartments[id].rooms = rooms;
      } else {
          require(apartments[id].rooms > 0, 'Rooms cannot be zero');
      }
      
      if (price > 0) {
          apartments[id].price = price;
      } else {
          require(apartments[id].price > 0, 'Price cannot be zero');
      }

      emit ApartmentUpdated(name, price, msg.sender);
  }


  function deleteAppartment(uint id) public {
    require(appartmentExist[id] == true, 'Appartment not found');
    require(apartments[id].owner == msg.sender, 'Unauthorized entity');

    
    delete appartmentExist[id];
    delete apartments[id];
    appartmentExist[id] = false;
    apartments[id].deleted = true;
  }

  function getApartments() public view returns (ApartmentStruct[] memory Apartments) {
    uint256 available;
    uint total = _totalAppartments;
    for (uint i = 1; i < total + 1; i++) {
      if (!apartments[i].deleted) available++;
    }

    Apartments = new ApartmentStruct[](available);

    uint256 index;
    for (uint i = 1; i <= _totalAppartments; i++) {
      if (!apartments[i].deleted) {
        Apartments[index++] = apartments[i];
      }
    }
  }

  function getApartment(uint id) public view returns (ApartmentStruct memory) {
    return apartments[id];
  }

  function bookApartment(uint aid, uint[] memory dates) public payable nonReentrant {
    require(appartmentExist[aid], 'Apartment not found!');
    uint256 daysCount = dates.length;
    uint256 rentCost = apartments[aid].price * daysCount;
    uint256 fee = (rentCost * securityFee) / 100;
    uint256 totalCost = rentCost + fee;

    require( msg.value >= totalCost, 'Insufficient fund!');
    require(datesAreCleared(aid, dates), 'Booked date found among dates!');

    for (uint i = 0; i < dates.length; i++) {
      require(dates[i] > block.timestamp, "Cannot book past dates");
      if (i > 0) {
        require(dates[i] > dates[i-1], "Dates must be in order");
      }
      bookingsOf[aid].push(BookingStruct({
        id: bookingsOf[aid].length,
        aid: aid,
        tenant: msg.sender,
        date: dates[i],
        price: apartments[aid].price,
        checked: false,
        cancelled: false
      }));
      isDateBooked[aid][dates[i]] = true;
      bookedDates[aid].push(dates[i]);
    }
  }

  function datesAreCleared(uint aid, uint[] memory dates) internal view returns (bool) {
    bool lastCheck = true;
    for (uint i = 0; i < dates.length; i++) {
      for (uint j = 0; j < bookedDates[aid].length; j++) {
        if (dates[i] == bookedDates[aid][j]) lastCheck = false;
      }
    }
    return lastCheck;
  }

  function checkInApartment(uint aid, uint bookingId) external nonReentrant {
    BookingStruct memory booking = bookingsOf[aid][bookingId];
    require(msg.sender == booking.tenant, 'Unauthorized tenant!');
    require(!booking.checked, 'Apartment already checked in!');
    require(appartmentExist[aid], "Apartment does not exist!");
    require(!booking.cancelled, "Booking has been cancelled!");
    require(block.timestamp >= booking.date, "Check-in date not reached yet!");
    require(block.timestamp <= booking.date + 1 days, "Check-in period expired!");

    bookingsOf[aid][bookingId].checked = true;
    uint fee = (booking.price * securityFee) / 100;

    hasBooked[msg.sender][aid] = true;

    payTo(apartments[aid].owner, (booking.price - fee));
    payTo(owner(), fee);
    //payTo(msg.sender, fee);
  }

  function checkOutApartment(uint aid, uint bookingId) external nonReentrant {
      // Fetch the booking details
      BookingStruct memory booking = bookingsOf[aid][bookingId];
      // Ensure the sender is the tenant
      require(msg.sender == booking.tenant, "Unauthorized Entity");
      // Ensure the booking is checked in
      require(booking.checked, "Not checked in");

      require(isDateBooked[aid][booking.date], 'Did not book on this date!');

      // Mark the booking as cancelled
      bookingsOf[aid][bookingId].cancelled = true;

      // Remove the booked dates
      isDateBooked[aid][booking.date] = false;

      uint lastIndex = bookedDates[aid].length - 1;
      uint lastBookingId = bookedDates[aid][lastIndex];
      bookedDates[aid][bookingId] = lastBookingId;
      bookedDates[aid].pop();
      
  }


  function refundBooking(uint aid, uint bookingId) external nonReentrant {
    BookingStruct memory booking = bookingsOf[aid][bookingId];
    require(!booking.checked, 'Apartment already checked on this date!');
    require(isDateBooked[aid][booking.date], 'Did not book on this date!');

    if (msg.sender != owner()) {
      require(msg.sender == booking.tenant, 'Unauthorized tenant!');
      require(booking.date < currentTime(), 'Can no longer refund, booking date started');
    }

    bookingsOf[aid][bookingId].cancelled = true;
    isDateBooked[aid][booking.date] = false;

    uint lastIndex = bookedDates[aid].length - 1;
    uint lastBookingId = bookedDates[aid][lastIndex];
    bookedDates[aid][bookingId] = lastBookingId;
    bookedDates[aid].pop();

    uint fee = (booking.price * securityFee) / 100;
    uint collateral = (booking.price * taxPercent) / 100;

    payTo(apartments[aid].owner, collateral);
    payTo(owner(), fee);
    payTo(msg.sender, booking.price - fee - collateral);
  }

  function getUnavailableDates(uint aid) public view returns (uint[] memory) {
    return bookedDates[aid];
  }

  function getBookings(uint aid) public view returns (BookingStruct[] memory) {
    return bookingsOf[aid];
  }

  function getQualifiedReviewers(uint aid) public view returns (address[] memory Tenants) {
    uint256 available;
    for (uint i = 0; i < bookingsOf[aid].length; i++) {
      if (bookingsOf[aid][i].checked) available++;
    }

    Tenants = new address[](available);

    uint256 index;
    for (uint i = 0; i < bookingsOf[aid].length; i++) {
      if (bookingsOf[aid][i].checked) {
        Tenants[index++] = bookingsOf[aid][i].tenant;
      }
    }
  }

  function getBooking(uint aid, uint bookingId) public view returns (BookingStruct memory) {
    return bookingsOf[aid][bookingId];
  }


  function payTo(address to, uint256 amount) internal {
    (bool success, ) = payable(to).call{ value: amount }('');
    require(success);
  }

  function addReview(uint aid, string memory reviewText) public {
    require(appartmentExist[aid], 'Appartment not available');
    require(hasBooked[msg.sender][aid], 'Book first before review');
    require(bytes(reviewText).length > 0, 'Review text cannot be empty');

    ReviewStruct memory review;

    review.aid = aid;
    review.id = reviewsOf[aid].length;
    review.reviewText = reviewText;
    review.timestamp = currentTime();
    review.owner = msg.sender;

    reviewsOf[aid].push(review);
  }

  function getReviews(uint aid) public view returns (ReviewStruct[] memory) {
    return reviewsOf[aid];
  }

  function tenantBooked(uint appartmentId) public view returns (bool) {
    return hasBooked[msg.sender][appartmentId];
  }

  function currentTime() internal view returns (uint256) {
    return (block.timestamp * 1000) + 1000;
  }

  receive() external payable {}

 



}