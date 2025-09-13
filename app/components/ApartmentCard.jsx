const ApartmentCard = ({
  apartment,
  onViewDetails,
  showBookButton = true,
  showTenantInfo = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative">
      {apartment.isBooked && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Booked
        </span>
      )}

      <img
        src={apartment.image || "/default-apartment.jpg"}
        alt={apartment.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">
            {apartment.name}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {ethers.utils.formatEther(apartment.price)} ETH/night
          </span>
        </div>

        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
          {apartment.description}
        </p>

        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {apartment.location}
          </div>

          {showTenantInfo && apartment.isBooked && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate" title={apartment.tenant}>
                {apartment.tenant.slice(0, 6)}...{apartment.tenant.slice(-4)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onViewDetails}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View Details →
          </button>
          {showBookButton && !apartment.isBooked && (
            <button
              onClick={() => {}}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              Book Now
            </button>
          )}
          
          {showTenantInfo && apartment.isBooked && (
            <div className="mt-2 text-xs text-gray-500">
              <div>
                Check-in:{" "}
                {new Date(apartment.checkInDate * 1000).toLocaleDateString()}
              </div>
              <div>
                Check-out:{" "}
                {new Date(apartment.checkOutDate * 1000).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;
