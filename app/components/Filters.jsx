// components/Filters.js
export default function Filters({ filters, setFilters, categories }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            placeholder="Any location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: parseFloat(e.target.value) || 0})}
              className="w-full p-2 border rounded"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: parseFloat(e.target.value) || 10})}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full p-2 border rounded"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => setFilters({
              location: '',
              minPrice: 0,
              maxPrice: 10,
              category: 'all'
            })}
            className="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}