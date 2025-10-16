'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { useApartmentStore } from '../hooks/useApartmentStore'

const BookingCalendar = ({ price }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection'
    }
  ])

  const setBookingDates = useApartmentStore((state) => state.setBookingDates)
  const booking = useApartmentStore((state) => state.booking)

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
      <p className="text-gray-600 mb-4">{price}ETH per night</p>
      
      <DateRange
        editableDateInputs={true}
        onChange={item => {
          setDateRange([item.selection])
          if (item.selection.startDate && item.selection.endDate) {
            setBookingDates(item.selection.startDate, item.selection.endDate, price)
          }
        }}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
        minDate={new Date()}
      />
      
      {booking.startDate && booking.endDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p>
            {format(booking.startDate, 'MMM d, yyyy')} - 
            {format(booking.endDate, 'MMM d, yyyy')}
          </p>
          <p className="font-semibold mt-1">
            Total: {booking.total} ETH
          </p>
        </div>
      )}
    </div>
  )
}

export default BookingCalendar
