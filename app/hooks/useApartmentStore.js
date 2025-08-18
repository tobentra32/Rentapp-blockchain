import { create } from 'zustand'

export const useApartmentStore = create((set) => ({
  apartments: [],
  apartment: null,
  reviews: [],
  securityFee: 0,
  bookings: [],
  booking: null,
  timestamps: [],
  reviewModal: false,
  loading: false,
  error: null,

  // Apartment Actions
  addApartment: (newApartment) => set(state => ({
    apartments: [...state.apartments, newApartment]
  })),
  setApartment: (apartment) => set({ apartment }),
  setApartments: (apartments) => set({ apartments }),

  // Booking Actions
  setBookings: (bookings) => set({ bookings }),
  
  addBooking: (newBooking) => set(state => ({
    bookings: [...state.bookings, newBooking]
  })),
  cancelBooking: (bookingId) => set(state => ({
    bookings: state.bookings.filter(booking => booking.id !== bookingId)
  })),

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
  
}))