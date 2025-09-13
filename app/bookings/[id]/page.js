import { useEffect } from 'react'
import BookingCard from '@/components/BookingCard'
import { useRouter } from 'next/router'
import { useStore } from '@/store/store'
import { getBookingsByUser } from '@/services/blockchain'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'

const Bookings = () => {
  const router = useRouter()
  const { address } = useAccount()
  
  // Zustand store state
  const { userBookings, setUserBookings } = useStore((state) => ({
    userBookings: state.userBookings,
    setUserBookings: state.setUserBookings
  }))

  // Fetch user bookings
  const fetchBookings = async () => {
    try {
      if (!address) return
      const bookings = await getBookingsByUser(address)
      setUserBookings(bookings)
    } catch (error) {
      toast.error('Error fetching bookings')
      console.error('Error fetching bookings:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [address])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all your apartment bookings
        </p>
      </div>

      {!address ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">
            Please connect your wallet to view your bookings
          </p>
        </div>
      ) : userBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">
            You don't have any bookings yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBookings.map((booking) => (
            <BookingCard 
              key={booking.id}
              booking={booking}
              onViewDetails={() => router.push(`/apartment/${booking.apartmentId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings