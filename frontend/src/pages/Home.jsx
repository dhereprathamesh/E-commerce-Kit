import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        console.log("dtaaaaaaaaaa", c);

        setProducts(p.data.data || []);
        setCategories(c.data.data || []);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {/* HERO */}
      <section className="bg-gray-900 text-white p-10 rounded-xl">
        <h1 className="text-3xl font-bold">Discover Products</h1>
        <p className="text-gray-300 mt-2">Clean, simple shopping experience</p>
      </section>

      {/* CATEGORIES */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="border rounded p-3 text-center hover:bg-gray-100"
            >
              {c.name}
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Featured Products</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
