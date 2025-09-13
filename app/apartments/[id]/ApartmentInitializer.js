"use client";

import { useEffect } from "react";
import { useApartmentStore } from "../../hooks/useApartmentStore";

export default function ApartmentInitializer({ apartment }) {
  const { setApartment, setReviews, setSecurityFee } = useApartmentStore();

  useEffect(() => {
    setApartment(apartment);
    setReviews(apartment.reviews || []);
    setSecurityFee(50); // Example security fee
  }, [apartment, setApartment, setReviews, setSecurityFee]);

  return null;
}
