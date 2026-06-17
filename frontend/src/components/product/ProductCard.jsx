// import { Link } from "react-router-dom";

// export default function ProductCard({ product }) {
//   return (
//     <Link
//       to={`/products/${product?.slug}`}
//       className="border rounded-lg p-3 hover:shadow-md transition bg-white"
//     >
//       <img
//         src={product.images?.[0] || "https://via.placeholder.com/300"}
//         className="h-40 w-full object-cover rounded"
//       />

//       <h3 className="font-medium mt-2">{product.name}</h3>

//       <div className="flex justify-between mt-1 text-sm">
//         <span className="text-gray-600">₹{product.price}</span>
//         <span className="text-gray-400">Stock: {product.stock}</span>
//       </div>
//     </Link>
//   );
// }

import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export default function ProductCard({ product }) {
  // eslint-disable-next-line react/prop-types
  const { name, slug, price, comparePrice, images, stock } = product;
  const primaryImage = images?.[0] || "https://via.placeholder.com/300";

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Product Image Box */}
      <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100 group-hover:opacity-90 transition-opacity">
        <img
          src={primaryImage}
          alt={name}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-slate-900">
          <Link to={`/products/${slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {name}
          </Link>
        </h3>

        {/* Price display with markdown discount check */}
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-slate-900">
            ${price}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-sm text-slate-400 line-through">
              ${comparePrice}
            </span>
          )}
        </div>

        {/* Stock status badge */}
        <p
          className={`text-xs font-medium ${stock > 0 ? "text-emerald-600" : "text-rose-600"}`}
        >
          {stock > 0 ? `${stock} in stock` : "Out of Stock"}
        </p>
      </div>
    </div>
  );
}
