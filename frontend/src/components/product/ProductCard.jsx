import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product?.slug}`}
      className="border rounded-lg p-3 hover:shadow-md transition bg-white"
    >
      <img
        src={product.images?.[0] || "https://via.placeholder.com/300"}
        className="h-40 w-full object-cover rounded"
      />

      <h3 className="font-medium mt-2">{product.name}</h3>

      <div className="flex justify-between mt-1 text-sm">
        <span className="text-gray-600">₹{product.price}</span>
        <span className="text-gray-400">Stock: {product.stock}</span>
      </div>
    </Link>
  );
}
