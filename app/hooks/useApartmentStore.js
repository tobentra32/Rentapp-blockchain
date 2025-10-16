import { create } from 'zustand'

export const useApartmentStore = create((set, get) => ({
  apartments: [],
  appartments: {},
  appartment: null,
  apartment: null,
  bookedApartments: [],
  reviews: [],
  securityFee: 0,
  bookings: [],
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
  },

  storeApartment: (id, data) =>
    set((state) => ({
      appartments: {
        ...state.appartments,
        [id]: data,
      },
      appartment: data,
    })),

  // Apartment Actions
  addApartment: (newApartment) => set(state => ({
    apartments: [...state.apartments, newApartment]
  })),
  setApartment: (apartment) => set({ apartment }),
  setApartments: (apartments) => set({ apartments }),


  getApartmentById: (id) => get().appartments[id],

  
  setSelectedApartmentId: (id) => set({ selectedApartmentId: id }),

  // Booking Actions
  setBookings: (bookings) => set({ bookings }),

  addBooking: (newBooking) => set(state => ({
    bookings: [...state.bookings, newBooking]
  })),
  cancelBooking: (bookingId) => set(state => ({
    bookings: state.bookings.filter(booking => booking.id !== bookingId)
  })),

  setBookedApartments: (apartments) => set({ bookedApartments: apartments }),

  // Review Actions
  setReviews: (reviews) => set({ reviews }),
  addReview: (newReview) => set(state => ({
    reviews: [...state.reviews, newReview]
  })),
  toggleReviewModal: () => set(state => ({
    reviewModal: !state.reviewModal
  })),

  // Timestamp Actions
  setTimestamps: (timestamps) => set({ timestamps }),
  addTimestamp: (newTimestamp) => set(state => ({
    timestamps: [...state.timestamps, newTimestamp]
  })),
  // Security Fee Actions
  setSecurityFee: (fee) => set({ securityFee: fee }),
  //setSecurityFee: (securityFee) => set({ securityFee }),


  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addBookedDates: (dates) => set((state) => ({
    apartment: state.apartment ? {
      ...state.apartment,
      bookedDates: [...state.apartment.bookedDates, ...dates]
    } : null
  })),

  // 🔹 Set booking dates + auto total calculation
  setBookingDates: (startDate, endDate, price) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const total = (diffDays + 1) * price
    // build list of timestamps
    const dates = []
    const d = new Date(startDate)
    while (d <= endDate) {
      dates.push(Math.floor(d.getTime() / 1000)) // store as seconds
      d.setDate(d.getDate() + 1)
    }

    set({
      booking: { startDate, endDate, price, total, dates }
    })
  },

}))