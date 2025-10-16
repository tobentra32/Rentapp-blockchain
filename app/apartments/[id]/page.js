"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  ApartmentTitle,
  ImageGallery,
  Description,
  BookingCalendar,
  BookingActions,
  ReviewList,
} from "../../components/index";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { useAppKitProvider } from "@reown/appkit/react";
import { useApartmentStore } from "../../hooks/useApartmentStore"; // ✅ Import store
import ApartmentInitializer from "./ApartmentInitializer";

import { useParams, useRouter } from "next/navigation"

// TODO: import your contract details
import contractAddress from "../../contract_details/contractAddress";
import contractAbi from "../../contract_details/contractAbi";

export default function ApartmentPage({ params }) {
  const { walletProvider } = useAppKitProvider("eip155");
  const { id } = useParams()  // <-- get dynamic route param safely
  const router = useRouter()                      

  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ Zustand actions and selectors
  const { storeApartment, getApartmentById } = useApartmentStore();

  useEffect(() => {
    async function loadData() {
      try {
        if (!walletProvider) return;

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAddress, contractAbi, signer);

        const data = await contract.getApartment(id);
        //const bookings = await contract.getUnavailableDates(id);
        //console.log("bookings:",bookings);
        //const timestamps = bookings.map((timestamp) => Number(timestamp))

        
        

        // shape data into JS object (depending on contract return type)
        const apt = {
          id: id,
          name: data.name,
          location: data.location,
          //rating: Number(data.rating),
          images: data.images || [],
          description: data.description,
          price: formatEther(data.price),
          //bookedDates: timestamps || [],
        };

        // ✅ Store in Zustand
        storeApartment(id, apt);

        

        setApartment(apt);
      } catch (err) {
        console.error("Error fetching apartment:", err);
      } finally {
        setLoading(false);
      }
    }


    loadData();
  }, [walletProvider, id, storeApartment]);

  console.log("apt:",apartment);

  const handleViewBooking = () => {
    router.push(`/bookings/${id}`) // navigate to booking page
  }

  if (loading) {
    return <div className="p-8 text-center">Loading apartment...</div>;
  }
  

  if (!apartment) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ApartmentInitializer apartment={apartment} />

      <ApartmentTitle
        name={apartment.name}
        location={apartment.location}
        rating={apartment.rating}
      />

      <ImageGallery images={apartment.images.split(",")}  />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <Description description={apartment.description} />
          <BookingCalendar
            //bookedDates={apartment.bookedDates}
            price={apartment.price}
          />
        </div>

        <div className="lg:col-span-1">
          <BookingActions price={apartment.price} apartmentId={apartment.id} />
          <button onClick={() => handleViewBooking()}
            
            className="w-full rounded my-20 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View booking
          </button>
        </div>

      </div>

      <ReviewList apartmentId={apartment.id} />
    </div>
  );
}
