import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ✅ Unified Zustand Store
export const useStore = create(
  persist(
    (set, get) => ({
      // 🏠 Apartment Data
      apartments: {}, // { [id]: { ...apartmentData } }

      storeApartment: (id, apartmentData) => {
        set((state) => ({
          apartments: {
            ...state.apartments,
            [id]: {
              ...(state.apartments[id] || {}),
              ...apartmentData,
            },
          },
        }))
      },

      getApartmentById: (id) => get().apartments[id],

      // 🧳 Bookings Data
      bookings: {}, // { [id]: { startDate, endDate, price, total, dates, ...otherData } }

      // Add booking (e.g., after blockchain booking tx)
      addBooking: (id, bookingData) => {
        set((state) => ({
          bookings: {
            ...state.bookings,
            [id]: {
              ...(state.bookings[id] || {}),
              ...bookingData,
            },
          },
        }))
      },

      // Set booking dates & total by booking ID
      setBookingDatesById: (id, startDate, endDate, price) => {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const total = (diffDays + 1) * price

        // build list of timestamps (in seconds)
        const dates = []
        const d = new Date(startDate)
        while (d <= endDate) {
          dates.push(Math.floor(d.getTime() / 1000))
          d.setDate(d.getDate() + 1)
        }

        set((state) => ({
          bookings: {
            ...state.bookings,
            [id]: {
              ...(state.bookings[id] || {}),
              startDate,
              endDate,
              price,
              total,
              dates,
            },
          },
        }))
      },

      // Get booking by its ID
      getBookingById: (id) => get().bookings[id],
    }),
    {
      name: 'rentapp-storage', // key for localStorage
      partialize: (state) => ({
        apartments: state.apartments,
        bookings: state.bookings,
      }),
    }
  )
)
