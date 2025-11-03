import { create } from 'zustand'

export const useApartmentStore = create((set, get) => ({
  apartments: [],
  appartments: {},
  appartment: null,
  apartment: null,
  bookedApartments: [],
  reviews: [],
  securityFee: 0,
  //bookings: [],
  booking: null,
  timestamps: [],
  reviewModal: false,
  loading: false,
  error: null,
  selectedApartmentId: null,

  // 🔹 Booking state
  booking: {
    startDate: null,
    endDate: null,
    price: 0,
    total: 0,
    dates: [],
  },

  // ===============================
  // 🔹 Apartment Management
  // ===============================
  storeApartment: (id, data) =>
    set((state) => ({
      appartments: {
        ...state.appartments,
        [id]: data,
      },
      appartment: data,
    })),

  addApartment: (newApartment) =>
    set((state) => ({
      apartments: [...state.apartments, newApartment],
    })),

  setApartment: (apartment) => set({ apartment }),
  setApartments: (apartments) => set({ apartments }),

  getApartmentById: (id) => get().appartments[id],

  setSelectedApartmentId: (id) => set({ selectedApartmentId: id }),

  // ===============================
  // 🔹 Review Management
  // ===============================
  setReviews: (reviews) => set({ reviews }),
  addReview: (newReview) =>
    set((state) => ({
      reviews: [...state.reviews, newReview],
    })),
  toggleReviewModal: () =>
    set((state) => ({
      reviewModal: !state.reviewModal,
    })),

  // ===============================
  // 🔹 Timestamp & Fee
  // ===============================
  setTimestamps: (timestamps) => set({ timestamps }),
  addTimestamp: (newTimestamp) =>
    set((state) => ({
      timestamps: [...state.timestamps, newTimestamp],
    })),
  setSecurityFee: (fee) => set({ securityFee: fee }),

  // ===============================
  // 🔹 Loading & Error
  // ===============================
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // ===============================
  // 🔹 Apartment Booked Dates
  // ===============================
  addBookedDates: (dates) =>
    set((state) => ({
      apartment: state.apartment
        ? {
            ...state.apartment,
            bookedDates: [...state.apartment.bookedDates, ...dates],
          }
        : null,
    })),

  // ===============================
  // 🔹 Booking Date Calculation
  // ===============================
  bookings: {}, // { [id]: { startDate, endDate, price, total, dates, ...otherData } }

  // 🔹 Add or update booking data from smart contract
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

  // 🔹 Set booking dates and total by booking id
  setBookingDatesById: (id, startDate, endDate, price) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const total = (diffDays + 1) * price

    // build list of timestamps (seconds)
    const dates = []
    const d = new Date(startDate)
    while (d <= endDate) {
      dates.push(Math.floor(d.getTime() / 1000))
      d.setDate(d.getDate() + 1)
    }

    // store under booking id
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

  // 🔹 Get booking by ID
  getBookingById: (id) => get().bookings[id] || {
    startDate: null,
    endDate: null,
    price: 0,
    total: 0,
    dates: [],
  },


  // ===============================
  // 🔹 Booking Management
  // ===============================

  

  // ✅ Remove booking by ID
  removeBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
    })),

  // ✅ Clear all bookings
  clearBookings: () => set({ bookings: [], booking: null }),
}));
