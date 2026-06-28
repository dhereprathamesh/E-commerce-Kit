// import { useEffect, useState } from "react";
// import api from "../services/api";
// import ProductCard from "../components/product/ProductCard";

// export default function Home() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [p, c] = await Promise.all([
//           api.get("/products"),
//           api.get("/categories"),
//         ]);
//         console.log("dtaaaaaaaaaa", c);

//         setProducts(p.data.data.products || []);
//         setCategories(c.data.data || []);
//       } catch (err) {
//         console.log(err);
//       }
//     })();
//   }, []);

//   return (
//     <div className="max-w-6xl mx-auto p-4 space-y-10">
//       {/* HERO */}
//       <section className="bg-gray-900 text-white p-10 rounded-xl">
//         <h1 className="text-3xl font-bold">Discover Products</h1>
//         <p className="text-gray-300 mt-2">Clean, simple shopping experience</p>
//       </section>

//       {/* CATEGORIES */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Categories</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {categories.map((c) => (
//             <div
//               key={c.id}
//               className="border rounded p-3 text-center hover:bg-gray-100"
//             >
//               {c.name}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* PRODUCTS */}
//       <section>
//         <h2 className="text-xl font-semibold mb-3">Featured Products</h2>

//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {products.map((p) => (
//             <ProductCard key={p.id} product={p} />
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Pass 'categoryId' as the query parameter to match your backend logic
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
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {/* HERO */}
      <section className="bg-gray-900 text-white p-10 rounded-xl">
        <h1 className="text-3xl font-bold">Discover Products</h1>
        <p className="text-gray-300 mt-2">Clean, simple shopping experience</p>
      </section>

      {/* CONTROLS (DROPDOWN & FILTERS) */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Featured Products
          </h2>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : `Showing ${products.length} ${products.length === 1 ? "product" : "products"}`}
          </p>
        </div>

        {/* CUSTOM CATEGORY DROPDOWN */}
        <div className="relative inline-block text-left min-w-[200px]">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
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
              {/* Invisible backdrop to close dropdown when clicking outside */}
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
                        ? "bg-gray-100 text-gray-950 font-medium"
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
                          ? "bg-gray-100 text-gray-950 font-medium"
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

      {/* PRODUCTS DISPLAY */}
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
              className="mt-2 text-sm text-gray-900 underline underline-offset-4 hover:text-gray-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
