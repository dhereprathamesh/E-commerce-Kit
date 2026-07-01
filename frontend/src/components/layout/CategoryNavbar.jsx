/* eslint-disable react/prop-types */
import {
  FaHome,
  FaLaptop,
  FaMobileAlt,
  FaTv,
  FaTshirt,
  FaShoppingBasket,
  FaSnowflake,
  FaClock,
} from "react-icons/fa";

// Change these names according to your category names
const iconMap = {
  Electronics: FaMobileAlt,
  "Home Appliances": FaHome,
  Laptops: FaLaptop,
  Television: FaTv,
  Fashion: FaTshirt,
  Grocery: FaShoppingBasket,
  Refrigerators: FaSnowflake,
  Watches: FaClock,
};

export default function CategoryNavbar({
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex justify-center items-center">
          {/* ALL CATEGORY */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-24 h-20 flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 border-b-2
              ${
                !selectedCategory
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:border-gray-300"
              }`}
          >
            <FaShoppingBasket className="text-xl mb-1" />

            <span className="text-[11px] font-medium text-center">All</span>
          </button>

          {/* CATEGORIES */}
          {categories.map((category) => {
            const Icon = iconMap[category.name] || FaShoppingBasket;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`w-24 h-20 flex-shrink-0 flex flex-col items-center justify-center transition-all duration-200 border-b-2
                  ${
                    selectedCategory?.id === category.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-blue-600 hover:border-gray-300"
                  }`}
              >
                <Icon className="text-xl mb-1" />

                <span className="text-[11px] font-medium text-center px-1 leading-tight">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
