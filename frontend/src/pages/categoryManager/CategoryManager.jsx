/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../../services/api";
import SubcategoryModal from "./components/SubcategoryModal";
import FilterGroupModal from "./components/FilterGroupModal";
import FilterValueModal from "./components/FilterValueModal";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [subCategoryFilters, setSubCategoryFilters] = useState([]);
  const [activeFilterGroup, setActiveFilterGroup] = useState(null);

  // Modal Toggles
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isValueOpen, setIsValueOpen] = useState(false);

  // Load master tree configurations
  const fetchAllCategories = async () => {
    const { data } = await api.get("/categories");
    console.log(data);

    setCategories(data.data);
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Fetch dynamic filters from backend whenever admin clicks a subcategory
  useEffect(() => {
    if (activeSubCategory) {
      api
        .get(`/filters/subcategory/${activeSubCategory.id}`)
        .then(({ data }) => {
          setSubCategoryFilters(data.data);
        });
    } else {
      setSubCategoryFilters([]);
    }
  }, [activeSubCategory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* COLUMN 1: CATEGORIES CONTAINER */}
      <div className="bg-white p-4 rounded-xl border">
        <h2 className="font-bold mb-4 text-gray-800">Categories</h2>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat);
                setActiveSubCategory(null);
              }}
              className={`p-3 rounded-lg cursor-pointer text-sm ${activeCategory?.id === cat.id ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-gray-50"}`}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* COLUMN 2: SUBCATEGORIES CONTAINER */}
      <div className="bg-white p-4 rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Subcategories</h2>
          <button
            disabled={!activeCategory}
            onClick={() => setIsSubOpen(true)}
            className="bg-indigo-600 text-white rounded p-1 text-xs disabled:opacity-40"
          >
            + Add Sub
          </button>
        </div>
        {activeCategory ? (
          <ul className="space-y-1">
            {activeCategory.subcategories?.map((sub) => (
              <li
                key={sub.id}
                onClick={() => setActiveSubCategory(sub)}
                className={`p-3 rounded-lg cursor-pointer text-sm ${activeSubCategory?.id === sub.id ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-gray-50"}`}
              >
                {sub.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs italic text-gray-400">Select a category node</p>
        )}
      </div>

      {/* COLUMN 3: FILTERS CONFIGURATION DESK */}
      <div className="bg-white p-4 rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Dynamic Group Filters</h2>
          <button
            disabled={!activeSubCategory}
            onClick={() => setIsGroupOpen(true)}
            className="bg-indigo-600 text-white rounded p-1 text-xs disabled:opacity-40"
          >
            + Add Group
          </button>
        </div>
        {activeSubCategory ? (
          <div className="space-y-4">
            {subCategoryFilters.map((group) => (
              <div key={group.id} className="border p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-gray-700">
                    {group.name}
                  </span>
                  <button
                    onClick={() => {
                      setActiveFilterGroup(group);
                      setIsValueOpen(true);
                    }}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    + Value
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.filterValues?.map((val) => (
                    <span
                      key={val.id}
                      className="text-xs bg-white border text-gray-600 px-2.5 py-1 rounded-md shadow-sm"
                    >
                      {val.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400">
            Select a subcategory node
          </p>
        )}
      </div>

      {/* MODAL MOUNT REGISTRATION GATEWAYS */}
      <SubcategoryModal
        isOpen={isSubOpen}
        onClose={() => setIsSubOpen(false)}
        activeCategory={activeCategory}
        onSubcategoryAdded={(newSub) => {
          // Updates layout by appending new subcategory locally inside current view arrays
          const updatedSubs = [...(activeCategory.subcategories || []), newSub];
          setActiveCategory({ ...activeCategory, subcategories: updatedSubs });
          fetchAllCategories(); // Sync main categories list array too
        }}
      />

      <FilterGroupModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        activeSubCategory={activeSubCategory}
        onGroupAdded={(newGroup) => {
          setSubCategoryFilters([
            ...subCategoryFilters,
            { ...newGroup, filterValues: [] },
          ]);
        }}
      />

      <FilterValueModal
        isOpen={isValueOpen}
        onClose={() => setIsValueOpen(false)}
        activeGroup={activeFilterGroup}
        onValueAdded={(groupId, newVal) => {
          setSubCategoryFilters(
            subCategoryFilters.map((group) => {
              if (group.id !== groupId) return group;
              return {
                ...group,
                filterValues: [...(group.filterValues || []), newVal],
              };
            }),
          );
        }}
      />
    </div>
  );
}
