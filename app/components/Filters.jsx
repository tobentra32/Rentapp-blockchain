export default function Filters({ filters, setFilters, categories }) {
  return (
    <div className="bg-white p-3 rounded-md shadow mb-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Location */}
        <div>
          <label className="block text-xs font-medium mb-1">Location</label>
          <input
            type="text"
            placeholder="Any"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium mb-1">Price Range</label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minPrice: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <span className="text-xs">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxPrice: parseFloat(e.target.value) || 10,
                })
              }
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-full px-2 py-1 border rounded text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        <div className="flex items-end">
          <button
            onClick={() =>
              setFilters({
                location: "",
                minPrice: 0,
                maxPrice: 10,
                category: "all",
              })
            }
            className="w-full bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
