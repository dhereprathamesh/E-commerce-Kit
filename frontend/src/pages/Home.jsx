import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import CategoryNavbar from "../components/layout/CategoryNavbar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Categories
  useEffect(() => {
    (async () => {
      try {
        const c = await api.get("/categories");
        setCategories(c.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    })();
  }, []);

  // Fetch Products based on selected category
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const url = selectedCategory
          ? `/products?categoryId=${selectedCategory.id}`
          : "/products";

        const p = await api.get(url);
        setProducts(p.data.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedCategory]);

  return (
    <>
      {/* Category sub-navigation layer */}
      <CategoryNavbar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Page Body Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* HERO BANNER */}
        <section className="bg-gradient-to-r from-gray-900 to-slate-800 text-white p-8 sm:p-12 rounded-2xl shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Discover Products
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base">
            Clean, simple shopping experience
          </p>
        </section>

        {/* CONTROLS (DROPDOWN & FILTERS) */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isLoading
                ? "Loading..."
                : `Showing ${products.length} ${products.length === 1 ? "product" : "products"}`}
            </p>
          </div>

          {/* CUSTOM CATEGORY DROPDOWN (SYNCED ACCESSORY) */}
          <div className="relative inline-block text-left min-w-[200px]">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <span>
                {selectedCategory ? selectedCategory.name : "All Categories"}
              </span>
              <svg
                className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1.1 0 011.414 0L10 10.586l3.293-3.293a1.1 0 111.414 1.414l-4 4a1.1 0 01-1.414 0l-4-4a1.1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-20 max-h-60 overflow-y-auto scrollbar-hide">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsDropdownOpen(false);
                      }}
                      className={`text-left block w-full px-4 py-2 text-sm ${
                        !selectedCategory
                          ? "bg-gray-100 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All Categories
                    </button>
                  </div>
                  <div className="py-1">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCategory(c);
                          setIsDropdownOpen(false);
                        }}
                        className={`text-left block w-full px-4 py-2 text-sm ${
                          selectedCategory?.id === c.id
                            ? "bg-gray-100 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* PRODUCTS DISPLAY GRID */}
        <section>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl border-gray-200">
              <p className="text-gray-500 font-medium">
                No products found in this category.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-2 text-sm text-blue-600 font-semibold underline underline-offset-4 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
