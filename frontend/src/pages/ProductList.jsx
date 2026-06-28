import { useState, useEffect } from "react";
import api from "../services/api";
import FilterSidebar from "../components/layout/FilterSidebar";
import ProductCard from "../components/product/ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  // Fetch initial catalog structural dependencies
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error("Failed fetching runtime categories:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Sync and fetch products whenever search query or facet filters modify
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (searchQuery) params.append("search", searchQuery);

        const response = await api.get(`/products?${params.toString()}`);
        setProducts(response.data?.data?.products || response.data || []);
      } catch (err) {
        console.error("Error compiling product listing array:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms Debounce to prevent server hammering on text inputs

    return () => clearTimeout(delayDebounce);
  }, [filters, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header Bar Layout */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Products
          </h1>
          <p className="text-sm text-slate-500">
            Discover quality and tailored configurations.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            /* Added pr-10 to prevent text from shifting behind the button */
            className="w-full rounded-md border border-slate-300 pl-4 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          {/* Render the clear button only when there is active text */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View Content */}
      <div className="flex flex-col md:flex-row gap-8">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-slate-100 bg-slate-50 p-4 h-72"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
              <p className="text-sm text-slate-500">
                No products found matching those criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
