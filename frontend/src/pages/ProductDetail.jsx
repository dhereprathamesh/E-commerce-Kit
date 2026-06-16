import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/products/${slug}`);
      console.log("res", res);

      setProduct(res.data.data);
    })();
  }, [slug]);

  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-8">
      {/* IMAGE */}
      <img
        src={product.images?.[0]}
        className="w-full h-80 object-cover rounded"
      />

      {/* INFO */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{product.name}</h1>

        <p className="text-gray-600">{product.description}</p>

        <div className="text-xl font-bold">₹{product.price}</div>

        {/* QUANTITY */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 border"
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 border"
          >
            +
          </button>
        </div>

        {/* ACTION */}
        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
