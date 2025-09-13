'use client'
import { useRouter } from 'next/navigation'
import { useApartmentStore } from '../hooks/useApartmentStore'

export default function BookingActions({ price, apartmentId, securityFee }) {
  const router = useRouter()
  const setApartment = useApartmentStore(state => state.setApartment)
  const total = price + securityFee

  return (
    <div className="border rounded-lg p-4 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Price per night:</span>
          <span>${price}</span>
        </div>
        <div className="flex justify-between">
          <span>Security Fee:</span>
          <span>${securityFee}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total:</span>
          <span>${total}</span>
        </div>
      </div>
      
      <button
        onClick={() => router.push(`/apartments/${apartmentId}/book`)}
        className="w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Book Now
      </button>
    </div>
  )
}