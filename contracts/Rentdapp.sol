// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";




contract Rentdapp is Ownable, ReentrancyGuard {

  IERC20Permit public permitToken; // Permit Interface

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
    uint collateral;
    uint commision;
  }

  struct ReviewStruct {
    uint id;
    uint aid;
    string reviewText;
    uint timestamp;
    address owner;
  }
  address public owner;
  uint256 public constant PERCENTAGE_FACTOR = 100; // For percentage calculation
  uint256 public _totalAppartments;
  uint256 public _totalBookings;

  
  uint256 public utilityFee = 1600000000000000; 

  mapping(uint => ApartmentStruct) apartments;
  mapping(uint => BookingStruct[]) bookingsOf;
  mapping(uint => ReviewStruct[]) reviewsOf;
  mapping(uint => bool) appartmentExist;
  mapping(uint => uint[]) bookedDates;
  mapping(uint => mapping(uint => bool)) isDateBooked;
  mapping(address => mapping(uint => bool)) hasBooked;

  constructor(address _tokenAddress) {
    
    owner = msg.sender;  // msg.sender is the address deploying the contract
    permitToken = IERC20Permit(_tokenAddress); // Permit token
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
    uint price,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(bytes(location).length > 0, 'Location cannot be empty');
    require(bytes(images).length > 0, 'Images cannot be empty');
    require(rooms > 0, 'Rooms cannot be zero');
    require(price > 0 , 'Price cannot be zero');
    
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
    payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);

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
    uint price,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
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
    payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);

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

  function deleteApartment(uint id, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
    require(appartmentExist[id], 'Appartment not found');
    require(msg.sender == apartments[id].owner, 'Unauthorized entity');

    appartmentExist[id] = false;
    apartments[id].deleted = true;

    // Emit the ApartmentDeleted event
    ApartmentStruct memory apartment = apartments[id];
    uint utility = utilityFee;
    payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);
    
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

    uint256 total_appartment_aval  = Apartments.length;
  }

  function getApartmentCount() public view returns (uint256){
    return _totalAppartments;
  }

  function bookApartment(uint aid, uint[] memory dates, uint256 deadline,uint8 v, bytes32 r, bytes32 s) external nonReentrant {
    uint totalPrice = apartments[aid].price * dates.length;
    uint totalCollateralFee;

    require(appartmentExist[aid], 'Apartment not found!');
    
    require(datesAreCleared(aid, dates), 'One or more dates not available');

    

    for (uint i = 0; i < dates.length; i++) {

      BookingStruct memory booking;
      booking.id = bookingsOf[aid].length;
      booking.aid = aid;
      booking.tenant = msg.sender;
      booking.date = dates[i];
      booking.price = apartments[aid].price;
      uint collateralCalc = calculateCollateral(booking.price, booking.date);
      uint commisionCalc = calculateCommission(booking.price);
      booking.collateral = collateralCalc;
      booking.commision = commisionCalc;
      bookingsOf[aid].push(booking);
      bookedDates[aid].push(dates[i]);
      isDateBooked[aid][dates[i]] = true;
      totalCollateralFee = totalCollateralFee + collateralCalc;
      hasBooked[msg.sender][aid] = true;
    }

    require(token.balanceOf(msg.sender) >= (totalPrice + totalCollateralFee), "Insufficient balance"); // Ensure user has enough tokens
    uint utility = utilityFee;
    // Collateral fee: daysRemaining * (price + 10%)
    uint256 collateral = totalCollateralFee;
    payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);
    payToWithPermit(msg.sender, address(this), collateral, deadline, v, r, s);
  }
  function checkInApartment(uint aid, uint bookingId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonReentrant {
    BookingStruct memory booking = bookingsOf[aid][bookingId];
    require(msg.sender == booking.tenant, 'Unauthorized Entity');
    require(!booking.checked, 'Already checked in');
    require(appartmentExist[aid], "Apartment does not exist!");
    require(!booking.cancelled, "Booking has been cancelled!");
    require(block.timestamp >= booking.date, "Check-in date not reached yet!");
    require(block.timestamp <= booking.date + 1 days, "Check-in period expired!");
    // Check if the user's balance is sufficient
    uint256 balance = token.balanceOf(msg.sender);
    require(balance >= price, "Insufficient balance");
    bookingsOf[aid][bookingId].checked = true;
    
    uint utility = utilityFee;
    uint collateral = booking.collateral;
    uint commision = booking.price * commisionPercent;

    payToWithPermit(msg.sender, apartments[aid].owner, booking.price - booking.commision, deadline, v, r, s);
    payToWithPermit(msg.sender, owner, booking.commision, deadline, v, r, s);
    payToUser(booking.tenant, collateral);
    payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);

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
      require(!datesAreCleared(aid, dates), "Dates are not booked");
      // Mark the booking as cancelled
      bookingsOf[aid][bookingId].cancelled = true;
      // Remove the booked dates
      for (uint i = 0; i < bookedDates[aid].length; i++) {
          if (bookedDates[aid][i] == booking.date) {
              isDateBooked[aid][booking.date] = false;
              bookedDates[aid][i] = bookedDates[aid][bookedDates[aid].length - 1];
              bookedDates[aid].pop();
              hasBooked[msg.sender][aid] = false;
              break;
          }
      }

      uint utility = utilityFee;
      payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);

      // Emit an event (optional)
      emit ApartmentCheckedOut(aid, bookingId, msg.sender, block.timestamp);
  }

  function cancelBooking(uint aid, uint bookingId, uint256 deadline,
      uint8 v,
      bytes32 r,
      bytes32 s) public nonReentrant {
      BookingStruct memory booking = bookingsOf[aid][bookingId];

      require(appartmentExist[aid], "Apartment not found!");
      // Ensure the sender is the tenant
      
      require(!booking.checked, "Already checked in");
      require(isDateBooked[aid][booking.date], 'Did not book on this date!');

      if (msg.sender != owner()) {
        require(msg.sender == booking.tenant, 'Unauthorized tenant!');
        require(booking.date > currentTime(), 'Can no longer refund, booking date started');
      }


      // Mark booking as cancelled
      booking.cancelled = true;


      isDateBooked[aid][booking.date] = false;

      uint lastIndex = bookedDates[aid].length - 1;
      uint lastBookingId = bookedDates[aid][lastIndex];
      bookedDates[aid][bookingId] = lastBookingId;
      bookedDates[aid].pop();



      uint utility = utilityFee;

      

      payToUser(apartments[aid].owner, booking.collateral);
      payToWithPermit(msg.sender, owner, booking.commision, deadline, v, r, s);
      payToWithPermit(msg.sender, address(this), utility, deadline, v, r, s);

      
      

      emit BookingCancelled(
          aid,
          bookingId,
          booking.tenant,
          refundAmount,
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
  
  function payToWithPermit(
      address payer, 
      address recipient,
      uint256 amount,
      uint256 deadline,
      uint8 v,
      bytes32 r,
      bytes32 s
  ) internal {

      // Check if the user's balance is sufficient
      uint256 balance = permitToken.balanceOf(payer);
      require(balance >= amount, "Insufficient balance");
      // Step 1: Check if allowance is sufficient
      uint256 allowance = permitToken.allowance(msg.sender, address(this));

      // Step 2: If allowance is less than required, approve via permit
      if (allowance < amount) {
          // Approve spending via Permit
          permitToken.permit(
              msg.sender,        // Owner
              address(this),     // Spender
              allowanceAmount,    // Value
              deadline,          // Deadline for permit
              v, r, s            // Signature parts
          );
      }

      // Step 3: Ensure sufficient allowance after permit
      require(
          permitToken.allowance(msg.sender, address(this)) >= amount,
          "Allowance too low"
      );

      require(payer != address(0), "Invalid sender");
      require(recipient != address(0), "Invalid recipient");
      require(amount > 0, "Amount must be greater than zero");



      // Step 4: Transfer amount
      

      bool success = permitToken.transferFrom(payer, recipient, amount); // Transfers tokens
      require(success, "Token transfer failed");
  }

  // Function to calculate collateral fee based on days until start date
  function calculateCollateral(uint256 price, uint256 startDate) internal view returns (uint256) {

    // Calculate the number of days until the start date
    uint256 daysRemaining = daysUntilStartDate(startDate);

    // Calculate 1.7% of the price
    uint256 feePercent = (price * 1.7) / PERCENTAGE_FACTOR;

    // Collateral fee: daysRemaining * (price * 10%)
    uint256 collateralFee = daysRemaining * feePercent;

    return collateralFee;
  }
  function calculateCommision(uint256 price) internal view returns (uint256) {
    // Calculate 10% of the price
    uint256 collateralFee = (price * 8) / PERCENTAGE_FACTOR;

    return collateralFee;
  }


  // Check the contract's token balance
  function contractBalance() external view returns (uint256) {
      return token.balanceOf(address(this));
  }

  // Function to calculate days until the start date
  function daysUntilStartDate(uint256 startDate) public view returns (uint256) {
      require(startDate > block.timestamp, "Start date must be in the future");
      return (startDate - block.timestamp) / 1 days; // Calculate days difference
  }


  function payUser(address recipient, uint256 amount) internal {
      require(recipient != address(0), "Invalid recipient address");
      require(permitToken.balanceOf(address(this)) >= amount, "Insufficient balance");

      bool success = permitToken.transfer(recipient, amount); // Transfer tokens
      require(success, "Token transfer failed");
  }


  // Withdraw tokens collected in contract by owner
  function withdrawTokens(address recipient, uint256 amount) external onlyOwner nonReentrant {
      require(permitToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
      require(permitToken.transfer(recipient, amount), "Withdraw failed");
      emit PaymentSent(recipient, amount);
  }


}
