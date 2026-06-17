// eslint-disable-next-line react/prop-types
export default function FilterSidebar({
  // eslint-disable-next-line react/prop-types
  filters,
  // eslint-disable-next-line react/prop-types
  setFilters,
  // eslint-disable-next-line react/prop-types
  categories = [],
}) {
  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryId ? "" : categoryId,
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <input
                type="checkbox"
                // eslint-disable-next-line react/prop-types
                checked={filters.category === cat.id}
                onChange={() => handleCategoryChange(cat.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            // eslint-disable-next-line react/prop-types
            value={filters.minPrice}
            onChange={handlePriceChange}
            className="w-full rounded-md border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-sm">to</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            // eslint-disable-next-line react/prop-types
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full rounded-md border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </aside>
  );
}
