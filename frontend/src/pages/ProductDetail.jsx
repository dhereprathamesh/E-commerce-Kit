// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../services/api";

// export default function ProductDetail() {
//   const { slug } = useParams();
//   const [product, setProduct] = useState(null);
//   const [quantity, setQuantity] = useState(1);

//   useEffect(() => {
//     (async () => {
//       const res = await api.get(`/products/${slug}`);
//       console.log("res", res);

//       setProduct(res.data.data);
//     })();
//   }, [slug]);

//   if (!product) return <div className="p-4">Loading...</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-8">
//       {/* IMAGE */}
//       <img
//         src={product.images?.[0]}
//         className="w-full h-80 object-cover rounded"
//       />

//       {/* INFO */}
//       <div className="space-y-4">
//         <h1 className="text-2xl font-semibold">{product.name}</h1>

//         <p className="text-gray-600">{product.description}</p>

//         <div className="text-xl font-bold">₹{product.price}</div>

//         {/* QUANTITY */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//             className="px-3 py-1 border"
//           >
//             -
//           </button>

//           <span>{quantity}</span>

//           <button
//             onClick={() => setQuantity((q) => q + 1)}
//             className="px-3 py-1 border"
//           >
//             +
//           </button>
//         </div>

//         {/* ACTION */}
//         <button className="bg-black text-white px-4 py-2 rounded w-full">
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCartStore } from "../store/cartStore";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItemToCart = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${slug}`);
        const productData = response.data.data;
        setProduct(productData);

        // Initialize with primary image
        if (productData?.images?.length > 0) {
          setActiveImage(productData.images[0]);
        }

        // Pre-select first variant if available
        if (productData?.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (err) {
        console.error("Error loading product detail record:", err);
        setError("Could not locate this product instance.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 animate-pulse space-y-8">
        <div className="h-96 bg-slate-100 rounded-lg w-full md:w-1/2 inline-block"></div>
        <div className="h-48 bg-slate-50 rounded-lg w-full md:w-5/12 inline-block md:ml-8"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          {error || "Product not found"}
        </h2>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Dispatch item payload to our upcoming Zustand store hook
    addItemToCart({
      productId: product.id,
      name: product.name,
      price: selectedVariant?.price || product.price,
      image: activeImage,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant
        ? `${selectedVariant.name}: ${selectedVariant.value}`
        : null,
      quantity: quantity,
    });

    // Smooth user feedback: open cart or show toast confirmation
    navigate("/cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        {/* Left Column: Image Gallery Box */}
        <div className="flex flex-col">
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img
              src={activeImage || "https://via.placeholder.com/600"}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="mx-auto mt-4 w-full max-w-2xl sm:block">
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white border ${
                      activeImage === img
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover object-center rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Configurator details */}
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              ${selectedVariant?.price || product.price}
            </p>
            {product.comparePrice && (
              <p className="text-lg text-slate-400 line-through">
                ${product.comparePrice}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <p className="space-y-6 text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants Selector Option Groups */}
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-2">
                Options / Variants
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedVariant?.id === v.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {v.name}: {v.value} (
                    {v.stock > 0 ? `$${v.price || product.price}` : "OOS"})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Action Area */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-slate-700">
                Quantity
              </span>
              <div className="flex items-center border border-slate-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm text-slate-900 font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                product.stock <= 0 &&
                (!selectedVariant || selectedVariant.stock <= 0)
              }
              className="flex w-full max-w-xs items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {product.stock > 0 || selectedVariant?.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
