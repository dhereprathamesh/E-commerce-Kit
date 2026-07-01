// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "react-router-dom";
// import api from "../services/api";
// import FilterSidebar from "../components/layout/FilterSidebar";
// import ProductCard from "../components/product/ProductCard";

// export default function ProductList() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchParams, setSearchParams] = useSearchParams();
//   const searchQuery = searchParams.get("search") || "";

//   // Track the previous search query to detect when a new search execution starts
//   const prevSearchQueryRef = useRef(searchQuery);

//   // Consolidated multi-tier filter state
//   const [filters, setFilters] = useState({
//     category: searchParams.get("category") || "",
//     subcategory: searchParams.get("subcategory") || "",
//     minPrice: searchParams.get("minPrice") || "",
//     maxPrice: searchParams.get("maxPrice") || "",
//     specValueIds: searchParams.get("specs")
//       ? searchParams.get("specs").split(",")
//       : [],
//   });

//   // Sync state filters if search parameters are changed manually elsewhere
//   useEffect(() => {
//     setFilters({
//       category: searchParams.get("category") || "",
//       subcategory: searchParams.get("subcategory") || "",
//       minPrice: searchParams.get("minPrice") || "",
//       maxPrice: searchParams.get("maxPrice") || "",
//       specValueIds: searchParams.get("specs")
//         ? searchParams.get("specs").split(",")
//         : [],
//     });
//   }, [searchParams]);

//   // Handle updates to the search query bar
//   const handleSearchChange = (val) => {
//     setSearchParams((prev) => {
//       if (val) prev.set("search", val);
//       else {
//         prev.delete("search");
//         prev.delete("category");
//         prev.delete("subcategory");
//         prev.delete("specs");
//       }
//       return prev;
//     });
//   };

//   // Fetch structural base categories once on mount
//   useEffect(() => {
//     const fetchBaseCategories = async () => {
//       try {
//         const catRes = await api.get("/categories");
//         setCategories(catRes.data.data || []);
//       } catch (err) {
//         console.error("Failed fetching categories:", err);
//       }
//     };
//     fetchBaseCategories();
//   }, []);

//   // Fetch products tracking BOTH filters and search strings natively
//   useEffect(() => {
//     let isMounted = true;

//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams();
//         if (filters.category) params.append("category", filters.category);
//         if (filters.subcategory)
//           params.append("subcategory", filters.subcategory);
//         if (filters.minPrice) params.append("minPrice", filters.minPrice);
//         if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
//         if (searchQuery) params.append("search", searchQuery);

//         if (filters.specValueIds.length > 0) {
//           params.append("filterValueIds", filters.specValueIds.join(","));
//         }

//         const response = await api.get(`/products?${params.toString()}`);
//         const productList =
//           response.data?.data?.products || response.data || [];

//         if (isMounted) {
//           setProducts(productList);

//           // Check if user changed the text search query since the last execution loop
//           const hasSearchChanged = prevSearchQueryRef.current !== searchQuery;
//           prevSearchQueryRef.current = searchQuery;

//           // --- FIXED PAYLOAD PREFILL LOGIC ---
//           // Auto pre-fill if there is a search term and the user changed the query text string
//           if (searchQuery && hasSearchChanged && productList.length > 0) {
//             const firstProduct = productList[0];

//             // Access keys mapped straight out of your log signature payload
//             const autoCategoryId =
//               firstProduct.subcategory?.categoryId ||
//               firstProduct.subcategory?.category?.id;
//             const autoSubCategoryId =
//               firstProduct.subcategoryId || firstProduct.subcategory?.id;

//             if (autoCategoryId) {
//               setFilters((prev) => ({
//                 ...prev,
//                 category: String(autoCategoryId),
//                 subcategory: autoSubCategoryId ? String(autoSubCategoryId) : "",
//               }));

//               // Sync parameters elegantly to keep navigation history alive
//               setSearchParams(
//                 (prevParams) => {
//                   prevParams.set("category", String(autoCategoryId));
//                   if (autoSubCategoryId) {
//                     prevParams.set("subcategory", String(autoSubCategoryId));
//                   }
//                   return prevParams;
//                 },
//                 { replace: true },
//               );
//             }
//           }
//           // ------------------------------------
//         }
//       } catch (err) {
//         console.error("Error fetching matching products:", err);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     const delayTime = searchQuery === "" ? 0 : 400;
//     const delayDebounce = setTimeout(() => {
//       fetchProducts();
//     }, delayTime);

//     return () => {
//       isMounted = false;
//       clearTimeout(delayDebounce);
//     };
//   }, [filters, searchQuery, setSearchParams]);

//   return (
//     <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//       <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//             {searchQuery
//               ? `Search Results for "${searchQuery}"`
//               : "All Products"}
//           </h1>
//           <p className="text-sm text-slate-500">
//             Found {products.length} matching entries.
//           </p>
//         </div>

//         <div className="relative w-full md:w-80">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchQuery}
//             onChange={(e) => handleSearchChange(e.target.value)}
//             className="w-full rounded-md border border-slate-300 pl-4 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//           {searchQuery && (
//             <button
//               type="button"
//               onClick={() => handleSearchChange("")}
//               className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100"
//             >
//               &times;
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         <FilterSidebar
//           filters={filters}
//           setFilters={setFilters}
//           categories={categories}
//         />

//         <div className="flex-1">
//           {loading ? (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {[...Array(6)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="animate-pulse rounded-lg border border-slate-100 bg-slate-50 h-72"
//                 />
//               ))}
//             </div>
//           ) : products.length === 0 ? (
//             <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
//               No products found matching those specific filters.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {products.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import FilterSidebar from "../components/layout/FilterSidebar";
import ProductCard from "../components/product/ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Consolidated multi-tier filter state sourced directly from URL
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    specValueIds: searchParams.get("specs")
      ? searchParams.get("specs").split(",")
      : [],
  });

  // Track if auto-prefill has already been handled for the current search query
  const prefilledQueryRef = useRef("");

  // 1. Sync React filter state whenever URL parameters alter
  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      subcategory: searchParams.get("subcategory") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      specValueIds: searchParams.get("specs")
        ? searchParams.get("specs").split(",")
        : [],
    });
  }, [searchParams]);

  // Handle local text search bar updates
  // const handleSearchChange = (val) => {
  //   setSearchParams((prev) => {
  //     if (val) {
  //       prev.set("search", val);
  //     } else {
  //       prev.delete("search");
  //       prev.delete("category");
  //       prev.delete("subcategory");
  //       prev.delete("specs");
  //     }
  //     return prev;
  //   });
  // };

  // Fetch structural base sidebar categories once on mount
  useEffect(() => {
    const fetchBaseCategories = async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error("Failed fetching categories:", err);
      }
    };
    fetchBaseCategories();
  }, []);

  // 2. Fetch products cleanly based on current filter states
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.subcategory)
          params.append("subcategory", filters.subcategory);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (searchQuery) params.append("search", searchQuery);

        if (filters.specValueIds.length > 0) {
          params.append("filterValueIds", filters.specValueIds.join(","));
        }

        const response = await api.get(`/products?${params.toString()}`);
        const productList =
          response.data?.data?.products || response.data || [];

        if (!isMounted) return;

        setProducts(productList);

        // --- AUTO-PREFILL LOGIC ---
        // Only trigger pre-fill if we have results, a search query, no active category selection,
        // and we haven't already performed a pre-fill evaluation for this specific keyword.
        if (
          searchQuery &&
          !filters.category &&
          productList.length > 0 &&
          prefilledQueryRef.current !== searchQuery
        ) {
          const firstProduct = productList[0];

          const autoCategoryId =
            firstProduct.subcategory?.categoryId ||
            firstProduct.subcategory?.category?.id;
          const autoSubCategoryId =
            firstProduct.subcategoryId || firstProduct.subcategory?.id;

          if (autoCategoryId) {
            // Commit keyword to ref immediately to prevent subsequent api loop-cycles from re-running this
            prefilledQueryRef.current = searchQuery;

            // Push changes cleanly into the URL. The first useEffect hook will map these values back to the UI state.
            setSearchParams(
              (prevParams) => {
                prevParams.set("category", String(autoCategoryId));
                if (autoSubCategoryId) {
                  prevParams.set("subcategory", String(autoSubCategoryId));
                }
                return prevParams;
              },
              { replace: true },
            );
          }
        }
      } catch (err) {
        console.error("Error fetching matching products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const delayTime = searchQuery === "" ? 0 : 400;
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, delayTime);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
    // REMOVED 'setSearchParams' from dependencies to eliminate re-trigger side-effects.
    // Tracking 'filters' object parameters directly prevents shallow reference rendering issues.
  }, [
    filters.category,
    filters.subcategory,
    filters.minPrice,
    filters.maxPrice,
    filters.specValueIds,
    searchQuery,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Products"}
          </h1>
          <p className="text-sm text-slate-500">
            Found {products.length} matching entries.
          </p>
        </div>
        {/* 
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-md border border-slate-300 pl-4 pr-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100"
            >
              &times;
            </button>
          )}
        </div> */}
      </div>

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
                  className="animate-pulse rounded-lg border border-slate-100 bg-slate-50 h-72"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
              No products found matching those specific filters.
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
