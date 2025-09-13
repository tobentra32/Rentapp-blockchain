import { useState, useEffect } from 'react'
import ApartmentCard from '@/components/ApartmentCard'
import { useStore } from '@/store/store'
import { getAllBookedApartments } from '@/services/blockchain'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'

const BookedApartments = () => {
  const router = useRouter()
  
  // Zustand store state
  const { bookedApartments, setBookedApartments } = useStore((state) => ({
    bookedApartments: state.bookedApartments,
    setBookedApartments: state.setBookedApartments
  }))

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
      const apartments = await getAllBookedApartments()
      setBookedApartments(apartments)
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
      Number(ethers.utils.formatEther(apartment.price)) >= Number(filters.minPrice)
    const meetsMaxPrice = !filters.maxPrice || 
      Number(ethers.utils.formatEther(apartment.price)) <= Number(filters.maxPrice)
    const meetsLocation = !filters.location || 
      apartment.location.toLowerCase().includes(filters.location.toLowerCase())
    const meetsBookedBy = !filters.bookedBy || 
      apartment.tenant.toLowerCase().includes(filters.bookedBy.toLowerCase())
    return meetsMinPrice && meetsMaxPrice && meetsLocation && meetsBookedBy
  })

  // Apply sorting
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    switch(sortOption) {
      case 'price-low':
        return Number(ethers.utils.formatEther(a.price)) - Number(ethers.utils.formatEther(b.price))
      case 'price-high':
        return Number(ethers.utils.formatEther(b.price)) - Number(ethers.utils.formatEther(a.price))
      case 'newest':
        return b.id - a.id
      case 'oldest':
        return a.id - b.id
      default:
        return 0
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedApartments.length / itemsPerPage)
  const paginatedApartments = sortedApartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    fetchAllBookedApartments()
  }, [])

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Booked Apartments</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all booked apartments in the system
        </p>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (ETH)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (ETH)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Any"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Any location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booked By</label>
            <input
              type="text"
              name="bookedBy"
              value={filters.bookedBy}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="User address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : bookedApartments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">
            No apartments have been booked yet
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedApartments.map((apartment) => (
              <ApartmentCard 
                key={apartment.id}
                apartment={apartment}
                onViewDetails={() => router.push(`/apartment/${apartment.id}`)}
                showBookButton={false}
                showTenantInfo={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-indigo-600 text-white' : 'border border-gray-300'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {paginatedApartments.length} of {filteredApartments.length} booked apartments
          </div>
        </>
      )}
    </div>
  )
}

export default BookedApartments