/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function FilterSidebar({
  filters,
  setFilters,
  categories = [],
}) {
  const [subcategories, setSubcategories] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // 1. Monitor Category selections -> Fetch dynamic subcategories
  useEffect(() => {
    if (!filters.category) {
      setSubcategories([]);
      setFilterGroups([]);
      return;
    }

    const fetchSubcategories = async () => {
      setLoadingSubcats(true);
      try {
        const response = await api.get(
          `/categories/subcategory?categoryId=${filters.category}`,
        );
        setSubcategories(response.data?.data || []);
      } catch (err) {
        console.error("Sidebar context subcategory download fault:", err);
        setSubcategories([]);
      } finally {
        setLoadingSubcats(false);
      }
    };

    fetchSubcategories();
  }, [filters.category]);

  // 2. Monitor Subcategory selections -> Fetch dynamic Specification parameters
  useEffect(() => {
    if (!filters.subcategory) {
      setFilterGroups([]);
      return;
    }

    const fetchFilters = async () => {
      setLoadingSpecs(true);
      try {
        const response = await api.get(
          `/filters/subcategory/${filters.subcategory}`,
        );
        setFilterGroups(response.data?.data || []);
      } catch (err) {
        console.error("Sidebar specs data layer download fault:", err);
        setFilterGroups([]);
      } finally {
        setLoadingSpecs(false);
      }
    };

    fetchFilters();
  }, [filters.subcategory]);

  // Handle modification to parent category nodes
  const handleCategoryChange = (catId) => {
    setFilters((prev) => ({
      ...prev,
      category: catId,
      subcategory: "", // Wipe child dependencies cleanly
      specValueIds: [],
    }));
  };

  // Handle modification to child subcategory nodes
  const handleSubcategoryChange = (subId) => {
    setFilters((prev) => ({
      ...prev,
      subcategory: subId,
      specValueIds: [], // Wipe current specifications selections cleanly
    }));
  };

  // Checkbox specs toggle helper logic mirror
  const handleSpecToggle = (valueId) => {
    const stringId = String(valueId);
    setFilters((prev) => {
      const isChecked = prev.specValueIds.includes(stringId);
      const nextSpecs = isChecked
        ? prev.specValueIds.filter((id) => id !== stringId)
        : [...prev.specValueIds, stringId];
      return { ...prev, specValueIds: nextSpecs };
    });
  };

  return (
    <div className="w-full md:w-64 bg-white border border-slate-200 rounded-xl p-5 space-y-6 shrink-0 h-fit">
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Filters
        </h2>

        {/* Core Category Dropdown */}
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Subcategory Dropdown Block */}
      {filters.category && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Subcategory
            </label>
            {loadingSubcats && (
              <span className="text-[10px] text-blue-600 animate-pulse">
                Loading...
              </span>
            )}
          </div>
          <select
            value={filters.subcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            disabled={subcategories.length === 0}
            className="w-full text-xs border rounded-lg p-2 bg-white outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 cursor-pointer"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamically Rendered Technical Specifications Block */}
      {filters.subcategory && (
        <div className="border-t pt-4 border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Specifications
            </h3>
            {loadingSpecs && (
              <span className="text-[10px] text-blue-600 animate-pulse">
                Loading...
              </span>
            )}
          </div>

          {filterGroups.length === 0 && !loadingSpecs ? (
            <p className="text-[11px] text-slate-400 italic">
              No specifications found for this filter scope.
            </p>
          ) : (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {filterGroups.map((group) => (
                <div key={group.id} className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.name}
                  </span>
                  <div className="space-y-1">
                    {group.filterValues?.map((val) => {
                      const isChecked = filters.specValueIds.includes(
                        String(val.id),
                      );
                      return (
                        <label
                          key={val.id}
                          className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900 selection:bg-transparent"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSpecToggle(val.id)}
                            className="h-3.5 w-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span
                            className={
                              isChecked ? "font-medium text-blue-600" : ""
                            }
                          >
                            {val.value}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Threshold Form Layout Block */}
      <div className="border-t pt-4 border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Price Range ($)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
            }
            className="w-full text-xs border rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            className="w-full text-xs border rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
