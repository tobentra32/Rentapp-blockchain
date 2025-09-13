'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

const BookingCalendar = ({ bookedDates, price }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection'
    }
  ])

  const disabledDates = bookedDates.map(date => new Date(date))

  const calculateTotal = (startDate, endDate, price) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays * price
  }

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
      <p className="text-gray-600 mb-4">${price} per night</p>
      
      <DateRange
        editableDateInputs={true}
        onChange={item => setDateRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
        disabledDates={disabledDates}
        minDate={new Date()}
      />
      
      {dateRange[0].startDate && dateRange[0].endDate && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p>
            {format(dateRange[0].startDate, 'MMM d, yyyy')} - 
            {format(dateRange[0].endDate, 'MMM d, yyyy')}
          </p>
          <p className="font-semibold mt-1">
            Total: ${calculateTotal(dateRange[0].startDate, dateRange[0].endDate, price)}
          </p>
        </div>
      )}
    </div>
  )
}

export default BookingCalendar;