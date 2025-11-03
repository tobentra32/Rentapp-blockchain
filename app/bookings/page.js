"use client"
import { useState, useEffect } from 'react'
import BookingCard from '../components/BookingCard'
import { BrowserProvider, Contract, formatEther } from "ethers"
import contractAddress from "../contract_details/contractAddress"
import contractAbi from '../contract_details/contractAbi'
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react"
import { toast } from 'react-toastify'
import { fetchBookings } from "../lib/rentdapp"
import { useRouter } from 'next/navigation'
import { useApartmentStore } from "../hooks/useApartmentStore";
import { ethers } from 'ethers'

const Bookings = () => {
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155');
  const [bookedApartments, setBookedApartments] = useState([]);
  const { getApartmentById } = useApartmentStore();
  const addBooking = useApartmentStore((state) => state.addBooking)
  const getBookingById = useApartmentStore((state) => state.getBookingById)
  const booking = getBookingById(1)

  const apartment = getApartmentById("1"); // e.g. Apartment with ID = 1
  console.log("apartment:",apartment);

  useEffect(() => {
    async function loadBookings() {
      try {
        console.log("Loading bookings...");
        
        const data = await fetchBookings(walletProvider); // Fetch bookings for userId 1
        console.log("DATA", data);
        addBooking(1, data);
        setBookedApartments(data);
      } catch (error) {
        console.error("❌ Error loading bookings:", error);
      }
    }
    loadBookings();
  }, []);




  // State for filters, sorting and pagination
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    bookedBy: '' // New filter for specific user
  })
  const [sortOption, setSortOption] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [loading, setLoading] = useState(false)
  // Fetch ALL booked apartments
  const fetchAllBookedApartments = async () => {
    try {
      setLoading(true)
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);
      const bookedApartments = await contract.getBookings(1);
      console.log("bookedApartment:", bookedApartments)
      
    } catch (error) {
      toast.error('Error fetching booked apartments')
      console.error('Error fetching booked apartments:', error)
    } finally {
      setLoading(false)
    }
  }

  

  // Apply filters
  const filteredApartments = bookedApartments.filter(apartment => {
    const meetsMinPrice = !filters.minPrice || 
      Number(ethers.formatEther(apartment.price)) >= Number(filters.minPrice)
    const meetsMaxPrice = !filters.maxPrice || 
      Number(ethers.formatEther(apartment.price)) <= Number(filters.maxPrice)
    const meetsLocation = !filters.location || 
      apartment.location.toLowerCase().includes(filters.location.toLowerCase())
    const meetsBookedBy = !filters.bookedBy || 
      apartment.tenant.toLowerCase().includes(filters.bookedBy.toLowerCase())
    return meetsMinPrice && meetsMaxPrice && meetsLocation && meetsBookedBy
  })

  // Apply sorting
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(ethers.formatEther(a.price)) - Number(ethers.formatEther(b.price));

      case 'price-high':
        return Number(ethers.formatEther(b.price)) - Number(ethers.formatEther(a.price));

      case 'newest':
        return Number(b.id) - Number(a.id);  // ✅ convert BigInt to Number

      case 'oldest':
        return Number(a.id) - Number(b.id);  // ✅ convert BigInt to Number

      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedApartments.length / itemsPerPage)
  const paginatedApartments = sortedApartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSortOption(e.target.value)
    setCurrentPage(1)
  }
  console.log("bookedApartment:", bookedApartments);
  const bookings = getBookingById(1);
  console.log('booking total:', bookings.total)


  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-sm text-gray-600">
            View all your apartment bookings
          </p>
        </div>
  
        {!address ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Please connect your wallet to view your bookings
            </p>
          </div>
        ) : bookedApartments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              You don't have any bookings yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookedApartments.map((booking) => (
              <BookingCard 
                key={booking.id}
                booking={booking}
                onViewDetails={() => router.push(`/apartment/${booking.apartmentId}`)}
              />
            ))}
          </div>
        )}
      </div>
    )
}

export default Bookings