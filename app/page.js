import { useState, useEffect } from 'react';
import { getAllApartments } from './lib/rentdapp';
import { Category, Collection, Filters } from './components/index';

const ITEMS_PER_PAGE = 6;

export default function Home() {

  const [allApartments, setAllApartments] = useState([]);
  const [displayedApartments, setDisplayedApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 10,
    category: 'all'
  });

  useEffect(() => {
    async function loadData() {
      const data = await getAllApartments();
      setAllApartments(data.filter(apt => !apt.deleted));
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = allApartments.filter(apt => {
      return (
        (filters.location === '' || 
         apt.location.toLowerCase().includes(filters.location.toLowerCase())) &&
        apt.price >= filters.minPrice &&
        apt.price <= filters.maxPrice &&
        (filters.category === 'all' || apt.category === filters.category)
      );
    });
    
    setDisplayedApartments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allApartments, filters]);

  // Pagination logic
  const totalPages = Math.ceil(displayedApartments.length / ITEMS_PER_PAGE);
  const paginatedApartments = displayedApartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="text-center py-12">Loading...</div>;



  

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Apartments</h1>
      
      <Filters 
        filters={filters} 
        setFilters={setFilters}
        categories={['all', ...new Set(allApartments.map(apt => apt.category))]}
      />
      <Category />
      <Collection apartments={paginatedApartments} />
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === i + 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
           </div>
      )}

      </main>
      
    </div>
  );
}
// Note: The above code assumes that the `getApartments` function is correctly implemented to fetch apartment data from the blockchain.