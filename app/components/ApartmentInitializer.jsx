// components/apartments/ApartmentInitializer.js
'use client'
import { useEffect } from 'react'
import { useApartmentStore } from '../hooks/useApartmentStore'

export default function ApartmentInitializer({ apartment }) {
  const { setApartment, setReviews, setSecurityFee } = useApartmentStore()
  
  useEffect(() => {
    // These calls update the Zustand store
    setApartment(apartment) // Updates apartment state
    setReviews(apartment.reviews || []) // Updates reviews state
    setSecurityFee(50) // Updates securityFee state
  }, [apartment])
  
  return null
}