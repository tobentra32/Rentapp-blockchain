import { ethers } from 'ethers'
import { formatDate } from '../utils'

const BookingCard = ({ booking, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">
            Booking #{booking.id.toString().slice(0, 8)}...
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Apartment:</span>
            <span className="font-medium">#{booking.apartmentId.toString().slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-medium">{formatDate(booking.checkInDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Paid:</span>
            <span className="font-medium">
              {ethers.utils.formatEther(booking.totalPrice)} ETH
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onViewDetails}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View Apartment Details →
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingCard