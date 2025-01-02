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

  event CheckedIn(uint indexed aid, uint indexed bookingId, address indexed tenant);


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

  event BookingUpdated(
      uint indexed aid,
      uint indexed bookingId,
      address tenant,
      uint[] dates,
      uint price,
      uint timestamp
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

  event BookingCancelled(
      uint indexed aid,
      uint indexed bookingId,
      address tenant,
      uint refundAmount,
      uint timestamp
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

  uint public collateralPerent;
  uint public commisionPercent;
  uint public utilityFee = 0.0016;

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
    owner = msg.sender;  // msg.sender is the address deploying the contract
  }

  modifier onlyOwner() {
      require(msg.sender == owner, "Not the owner");
      _;
  }

  function getUtilityFee() public view returns (uint256) {
    return utilityFee;
  }

  // Function to update the utility fee - onlyOwner can call
  function setUtilityFee(uint256 _newFee) public onlyOwner {
    require(_newFee > 0, "Utility fee must be greater than 0");
    utilityFee = _newFee;
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

    uint utility = utilityFee;
   
    payTo(msg.sender,owner(), utility);

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

    uint utility = utilityFee;

    payTo(msg.sender,address(this), utility);

    // Emit the ApartmentUpdated event```
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
    uint utility = utilityFee;

    payTo(msg.sender, owner, utility);
    
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



  function bookApartment(uint aid, uint[] memory dates) public payable nonReentrant {
    uint totalPrice = apartments[aid].price * dates.length;
    uint totalSecurityFee = (totalPrice * securityFee) / 100;

    require(appartmentExist[aid], 'Apartment not found!');
    require(token.balanceOf(payer) >= (totalPrice + totalSecurityFee), "Insufficient balance"); // Ensure user has enough tokens
    require(datesAreCleared(aid, dates), 'One or more dates not available');

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

    uint day = dates.length;

    uint utility = utilityFee;
    uint collateral = booking.price * collateralPerent * day;

    

    payTo(msg.sender, owner, utility);
    payTo(msg.sender, address(this), collateral);
  }
  function checkInApartment(uint aid, uint bookingId) public nonReentrant {
    BookingStruct memory booking = bookingsOf[aid][bookingId];
    require(msg.sender == booking.tenant, 'Unauthorized Entity');
    require(!booking.checked, 'Already checked in');
    require(appartmentExist[aid], "Apartment does not exist!");
    require(!booking.cancelled, "Booking has been cancelled!");
    require(block.timestamp >= booking.date, "Check-in date not reached yet!");
    require(block.timestamp <= booking.date + 1 days, "Check-in period expired!");

    bookingsOf[aid][bookingId].checked = true;
    hasBooked[msg.sender][aid] = true;

    uint day = dates.length;

    uint utility = utilityFee;
    uint collateral = booking.price * collateralPerent * day;
    uint commision = booking.price * commisionPercent;

    payTo(msg.sender, apartments[aid].owner, booking.price - commision);
    payTo(msg.sender, owner, commision);
    payTo(address(this), booking.tenant, collateral);

    emit CheckedIn(aid, bookingId, msg.sender);
  }

  function checkOutApartment(uint aid, uint bookingId) public nonReentrant {
      // Fetch the booking details
      BookingStruct memory booking = bookingsOf[aid][bookingId];

      // Ensure the sender is the tenant
      require(msg.sender == booking.tenant, "Unauthorized Entity");

      // Ensure the booking is checked in
      require(booking.checked, "Not checked in");

      // Ensure the dates are cleared
      require(datesAreCleared(aid, dates), "Dates are already booked");

      // Mark the booking as cancelled
      bookingsOf[aid][bookingId].cancelled = true;

      // Refund the user for remaining days if required
      uint refundAmount = (booking.price * dates.length);

      // Transfer refund to the tenant
      payTo(booking.tenant, refundAmount);

      // Remove the booked dates
    
      
      for (uint i = 0; i < bookedDates[aid].length; i++) {
          if (bookedDates[aid][i] == booking.date) {
              isDateBooked[aid][booking.date] = false;
              bookedDates[aid][i] = bookedDates[aid][bookedDates[aid].length - 1];
              bookedDates[aid].pop();
              break;
          }
      }

      // Emit an event (optional)
      emit ApartmentCheckedOut(aid, bookingId, msg.sender, block.timestamp);
  }


  function updateBooking(
    uint aid,
    uint bookingId,
    uint[] memory newDates
  ) public nonReentrant {
    // Fetch the booking details
    BookingStruct storage booking = bookingsOf[aid][bookingId];
  
    // Ensure the sender is the tenant
    require(msg.sender == booking.tenant, "Unauthorized entity");
  
    // Ensure the booking is not cancelled
    require(!booking.cancelled, "Booking is already cancelled");
  
    // Ensure the booking has not been checked in
    require(!booking.checked, "Booking already checked in");
  
    // Check if new dates are available
    require(datesAreCleared(aid, newDates), "One or more new dates are unavailable");
  
    // Refund for old dates if required
    uint oldPrice = booking.price * bookedDates[aid].length;
  
    // Clear old dates
    for (uint i = 0; i < bookedDates[aid].length; i++) {
        isDateBooked[aid][bookedDates[aid][i]] = false;
    }
    delete bookedDates[aid];
  
    // Assign new dates
    for (uint i = 0; i < newDates.length; i++) {
        bookedDates[aid].push(newDates[i]);
        isDateBooked[aid][newDates[i]] = true;
    }
  
    // Update booking details
    booking.date = newDates[0];
    booking.price = apartments[aid].price * newDates.length;
  
    // Emit the BookingUpdated event
    emit BookingUpdated(
        aid,
        bookingId,
        msg.sender,
        newDates,
        booking.price,
        block.timestamp
    );
  }


  function cancelBooking(uint aid, uint bookingId) public nonReentrant {
      BookingStruct memory booking = bookingsOf[aid][bookingId];

      require(appartmentExist[aid], "Apartment not found!");
      require(!booking.checked, "Already checked in");
      require(!booking.cancelled, "Booking already cancelled");
      require(block.timestamp > booking.date, "Booking date not expired");

      // Mark booking as cancelled
      booking.cancelled = true;

      // Release booked dates
      for (uint i = 0; i < bookedDates[aid].length; i++) {
          if (bookedDates[aid][i] == booking.date) {
              isDateBooked[aid][booking.date] = false;
              bookedDates[aid][i] = bookedDates[aid][bookedDates[aid].length - 1];
              bookedDates[aid].pop();
              break;
          }
      }

      // Refund tenant partially (if required)
      uint collateral = booking.price * collateralPerent * day; // Deduct security fee

      payTo(msg.sender,apartments[aid].owner, collateral);

      emit BookingCancelled(
          aid,
          bookingId,
          booking.tenant,
          refundAmount,
          block.timestamp
      );
    
  }

  
  
  function claimFunds(uint aid, uint bookingId) public {
    
    require(msg.sender == apartments[aid].owner, 'Unauthorized entity');
    require(!bookingsOf[aid][bookingId].checked, 'Apartment already checked on this date!');
    require(booking.date < currentTime(), 'Not allowed, booking date not exceeded');
  
    payTo(apartments[aid].owner, booking.price - tax);
    emit FundsClaimed(
        msg.sender,
        collateral,
        block.timestamp
    );
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

  function getBooking(uint aid, uint bookingId) public view returns (BookingStruct memory) {
    return bookingsOf[aid][bookingId];
  }

  function getBookings(uint aid) public view returns (BookingStruct[] memory) {
    return bookingsOf[aid];
  }

  function getUnavailableDates(uint aid) public view returns (uint[] memory) {
    return bookedDates[aid];
  }

  function addReview(uint aid, string memory comment) public {
    require(appartmentExist[aid], 'Appartment not available');
    require(hasBooked[msg.sender][aid], 'Book first before review');
    require(bytes(comment).length > 0, 'Comment cannot be empty');
    ReviewStruct memory review;
    review.id = reviewsOf[aid].length;
    review.aid = aid;
    review.reviewText = comment;
    review.owner = msg.sender;
    review.timestamp = currentTime();

    reviewsOf[aid].push(review);
  }

  function getReviews(uint aid) public view returns (ReviewStruct[] memory) {
    return reviewsOf[aid];
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

  function tenantBooked(uint aid) public view returns (bool) {
    return hasBooked[msg.sender][aid];
  }

  function currentTime() internal view returns (uint256) {
    return (block.timestamp * 1000) + 1000;
  }


  function payTo(address payer, address recipient, uint256 amount) internal nonReentrant {

    require(token.allowance(payer, address(this)) >= amount, "Insufficient allowance");
    require(sender != address(0), "Invalid sender");
    require(recipient != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be greater than zero");
    

    bool success = token.transferFrom(payer, recipient, amount); // Transfers tokens
    require(success, "Token transfer failed");
    
  }

  function batchPayments(
    address[] memory payer,
    address[] memory recipients,
    uint256[] memory amounts
  ) internal {
    require(recipients.length == amounts.length, "Mismatched arrays");

    for (uint256 i = 0; i < recipients.length; i++) {
        require(token.balanceOf(address(this)) >= amounts[i], "Insufficient contract balance");
        bool success = token.transfer(recipients[i], amounts[i]);
        require(success, "Token transfer failed");
    }
  }


  function payUser(address recipient, uint256 amount) external onlyOwner {
      require(recipient != address(0), "Invalid recipient address");
      require(token.balanceOf(address(this)) >= amount, "Insufficient balance");

      bool success = token.transfer(recipient, amount); // Transfer tokens
      require(success, "Token transfer failed");

      emit PaymentSent(recipient, amount);
  }


  // Withdraw tokens collected in contract by owner
  function withdrawTokens(address recipient, uint256 amount) external onlyOwner nonReentrant {
      require(token.balanceOf(address(this)) >= amount, "Insufficient contract balance");
      require(token.transfer(recipient, amount), "Withdraw failed");
      emit PaymentSent(recipient, amount);
  }


  function withdrawFees() public onlyOwner {
      uint256 balance = token.balanceOf(address(this));
      require(balance > 0, "No tokens to withdraw");
      require(token.transfer(owner, balance), "Withdraw failed");
  }


}