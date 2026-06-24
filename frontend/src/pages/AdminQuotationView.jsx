// import { useEffect, useState } from "react";
// import api from "../services/api";

// export default function AdminQuotationView() {
//   const [quotes, setQuotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   console.log("Current Quotes Data State:", quotes);

//   useEffect(() => {
//     api
//       .get("/purchase-orders?view=quotations")
//       .then((res) => {
//         // Adjust for your global wrapper response format (.data.data)
//         const arrayData = res.data?.data || res.data || [];
//         setQuotes(arrayData);
//       })
//       .catch((err) => console.error("Error pulling quotations:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="p-6 text-sm text-slate-400 italic">
//         Processing terminal active array indices...
//       </div>
//     );

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-950">
//           Vendor Independent Quotations
//         </h1>
//         <p className="text-sm text-slate-500">
//           Isolate variant metrics mapping proposals against benchmark original
//           administrative allocations.
//         </p>
//       </div>

//       {quotes.length === 0 ? (
//         <p className="text-sm italic text-slate-400">
//           No records inside the quotation system partition currently.
//         </p>
//       ) : (
//         <div className="space-y-6">
//           {quotes.map((quote) => {
//             // FALLBACKS: If the backend returns a PO structure directly, map the fields gracefully
//             const parentPoId = quote?.purchaseOrderId || quote?.id || "";
//             const quoteId = quote?.id || "";
//             const supplierName = quote?.supplier?.name || "Unknown Supplier";
//             const totalCost = quote?.totalQuotedCost ?? quote?.totalAmount ?? 0;
//             const itemsList = quote?.items || [];

//             return (
//               <div
//                 key={quoteId}
//                 className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
//               >
//                 <div className="flex justify-between items-center border-b pb-3">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-base">
//                       {supplierName}
//                     </h3>
//                     <p className="text-xs font-mono text-slate-400">
//                       Quote ID: #{quoteId.slice(0, 8)} | Parent PO Link: #
//                       {parentPoId
//                         ? parentPoId.slice(0, 8).toUpperCase()
//                         : "N/A"}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded border border-blue-100">
//                       Received Submittal
//                     </span>
//                     <p className="text-base font-extrabold text-slate-950 mt-1">
//                       Total Valuation: ${totalCost.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 <table className="w-full text-left text-xs text-slate-600 divide-y">
//                   <thead>
//                     <tr className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
//                       <th className="p-2">Product Description Name</th>
//                       <th className="p-2">Proposed Quoted Variant Quantity</th>
//                       <th className="p-2">Proposed Unit Wholesale Price</th>
//                       <th className="p-2 text-center">Fulfillability State</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {itemsList.map((item) => {
//                       const isAvailable = item?.isAvailable ?? true;
//                       const productName =
//                         item?.product?.name || "Unknown Product";
//                       const qty = item?.quotedQuantity ?? item?.quantity ?? 0;
//                       const price =
//                         item?.quotedPrice ?? item?.purchasePrice ?? 0;

//                       return (
//                         <tr
//                           key={item?.id}
//                           className={
//                             isAvailable
//                               ? ""
//                               : "bg-red-50 text-slate-400 line-through"
//                           }
//                         >
//                           <td className="p-2 font-medium text-slate-900">
//                             {productName}
//                           </td>
//                           <td className="p-2 font-mono font-semibold">
//                             {isAvailable ? `${qty} Units` : "—"}
//                           </td>
//                           <td className="p-2 font-mono font-semibold text-blue-600">
//                             {isAvailable ? `$${price.toFixed(2)}` : "—"}
//                           </td>
//                           <td className="p-2 text-center">
//                             <span
//                               className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                                 isAvailable
//                                   ? "bg-green-50 text-green-700 border border-green-200"
//                                   : "bg-red-50 text-red-700 border border-red-200"
//                               }`}
//                             >
//                               {isAvailable
//                                 ? "AVAILABLE IN STOCK"
//                                 : "UNAVAILABLE"}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import api from "../services/api";

// export default function AdminQuotationView() {
//   const [quotes, setQuotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submittingId, setSubmittingId] = useState(null); // Track loader for specific button action

//   // Unified data retrieval logic configuration hook loop
//   const fetchQuotations = () => {
//     setLoading(true);
//     api
//       .get("/purchase-orders?view=quotations")
//       .then((res) => {
//         const arrayData = res.data?.data || res.data || [];
//         setQuotes(arrayData);
//       })
//       .catch((err) => console.error("Error pulling quotations:", err))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchQuotations();
//   }, []);

//   // Action hook layout to hit the new backend approval route
//   const handleApproveQuotation = async (quotationId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to approve this quotation configuration?",
//       )
//     )
//       return;

//     setSubmittingId(quotationId);
//     try {
//       await api.post(`/purchase-orders/quotations/${quotationId}/approve`);
//       alert(
//         "Quotation approved! Notification emails have been successfully queued.",
//       );
//       fetchQuotations(); // Refresh data layout matrices mapping
//     } catch (err) {
//       console.error("Failed to execute approval process route:", err);
//       alert(
//         err?.response?.data?.message ||
//           "An unexpected error disrupted validation processes.",
//       );
//     } finally {
//       setSubmittingId(null);
//     }
//   };

//   if (loading)
//     return (
//       <div className="p-6 text-sm text-slate-400 italic">
//         Processing terminal active array indices...
//       </div>
//     );

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-950">
//           Vendor Independent Quotations
//         </h1>
//         <p className="text-sm text-slate-500">
//           Isolate variant metrics mapping proposals against benchmark original
//           administrative allocations.
//         </p>
//       </div>

//       {quotes.length === 0 ? (
//         <p className="text-sm italic text-slate-400">
//           No records inside the quotation system partition currently.
//         </p>
//       ) : (
//         <div className="space-y-6">
//           {quotes.map((quote) => {
//             const trueQuotationId = quote?.quotations?.[0]?.id || quote?.id;
//             const parentPoId = quote?.purchaseOrderId || quote?.id || "";
//             const quoteId = quote?.id || "";
//             const supplierName = quote?.supplier?.name || "Unknown Supplier";
//             const totalCost = quote?.totalQuotedCost ?? quote?.totalAmount ?? 0;
//             const itemsList = quote?.items || [];

//             // Check status context if passed dynamically via the API payload wrapper link setup
//             const isAlreadyApproved =
//               quote?.purchaseOrder?.status === "APPROVED";

//             return (
//               <div
//                 key={quoteId}
//                 className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
//               >
//                 <div className="flex justify-between items-center border-b pb-3">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-base">
//                       {supplierName}
//                     </h3>
//                     <p className="text-xs font-mono text-slate-400">
//                       Quote ID: #{quoteId.slice(0, 8)} | Parent PO Link: #
//                       {parentPoId
//                         ? parentPoId.slice(0, 8).toUpperCase()
//                         : "N/A"}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span
//                       className={`text-xs font-semibold px-2.5 py-1 rounded border ${
//                         isAlreadyApproved
//                           ? "bg-green-50 text-green-700 border-green-100"
//                           : "bg-blue-50 text-blue-700 border-blue-100"
//                       }`}
//                     >
//                       {isAlreadyApproved
//                         ? "Approved Workflow"
//                         : "Received Submittal"}
//                     </span>
//                     <p className="text-base font-extrabold text-slate-950 mt-1">
//                       Total Valuation: ${totalCost.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 <table className="w-full text-left text-xs text-slate-600 divide-y">
//                   <thead>
//                     <tr className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
//                       <th className="p-2">Product Description Name</th>
//                       <th className="p-2">Proposed Quoted Variant Quantity</th>
//                       <th className="p-2">Proposed Unit Wholesale Price</th>
//                       <th className="p-2 text-center">Fulfillability State</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {itemsList.map((item) => {
//                       const isAvailable = item?.isAvailable ?? true;
//                       const productName =
//                         item?.product?.name || "Unknown Product";
//                       const qty = item?.quotedQuantity ?? item?.quantity ?? 0;
//                       const price =
//                         item?.quotedPrice ?? item?.purchasePrice ?? 0;

//                       return (
//                         <tr
//                           key={item?.id}
//                           className={
//                             isAvailable
//                               ? ""
//                               : "bg-red-50 text-slate-400 line-through"
//                           }
//                         >
//                           <td className="p-2 font-medium text-slate-900">
//                             {productName}
//                           </td>
//                           <td className="p-2 font-mono font-semibold">
//                             {isAvailable ? `${qty} Units` : "—"}
//                           </td>
//                           <td className="p-2 font-mono font-semibold text-blue-600">
//                             {isAvailable ? `$${price.toFixed(2)}` : "—"}
//                           </td>
//                           <td className="p-2 text-center">
//                             <span
//                               className={`px-2 py-0.5 rounded text-[10px] font-bold ${
//                                 isAvailable
//                                   ? "bg-green-50 text-green-700 border border-green-200"
//                                   : "bg-red-50 text-red-700 border border-red-200"
//                               }`}
//                             >
//                               {isAvailable
//                                 ? "AVAILABLE IN STOCK"
//                                 : "UNAVAILABLE"}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {/* ACTION BUTTON FOOTER BAR */}
//                 <div className="flex justify-end pt-2 border-t border-slate-100">
//                   <button
//                     onClick={() => handleApproveQuotation(trueQuotationId)} // Ensure this is the Quotation table ID if using your original service code
//                     disabled={submittingId !== null || isAlreadyApproved}
//                     className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
//                       isAlreadyApproved
//                         ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                         : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
//                     }`}
//                   >
//                     {submittingId === quoteId
//                       ? "Processing..."
//                       : isAlreadyApproved
//                         ? "Quotation Approved"
//                         : "Approve Quotation Order"}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import api from "../services/api";

// Enum array map configuration layout
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "OTP_SENT", label: "OTP Sent" },
  { value: "QUOTED", label: "Quoted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "RECEIVED", label: "Received" },
];

export default function AdminQuotationView() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL"); // Filter state tracker

  // Modified data retrieval logic incorporating structural query params
  const fetchQuotations = (selectedStatus) => {
    setLoading(true);

    // Construct request routing parameters dynamically
    let url = `/purchase-orders?view=quotations`;
    if (selectedStatus && selectedStatus !== "ALL") {
      url += `&status=${selectedStatus}`;
    }

    api
      .get(url)
      .then((res) => {
        const arrayData = res.data?.data || res.data || [];
        setQuotes(arrayData);
      })
      .catch((err) => console.error("Error pulling quotations:", err))
      .finally(() => setLoading(false));
  };

  // Re-run anytime selection change parameters are executed
  useEffect(() => {
    fetchQuotations(statusFilter);
  }, [statusFilter]);

  const handleApproveQuotation = async (quotationId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this quotation configuration?",
      )
    ) {
      return;
    }

    setSubmittingId(quotationId);
    try {
      await api.post(`/purchase-orders/quotations/${quotationId}/approve`);
      alert(
        "Quotation approved! Notification emails have been successfully queued.",
      );
      fetchQuotations(statusFilter); // Reloads matrix with maintaining filters active
    } catch (err) {
      console.error("Failed to execute approval process route:", err);
      alert(
        err?.response?.data?.message ||
          "An unexpected error disrupted validation processes.",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  // Helper utility mapping stylistic attributes dynamically against enum values
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "APPROVED":
      case "RECEIVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
      case "QUOTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "OTP_SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER BAR AND FILTER SYSTEM SELECTION COMPONENT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Vendor Independent Quotations
          </h1>
          <p className="text-sm text-slate-500">
            Isolate variant metrics mapping proposals against benchmark original
            administrative allocations.
          </p>
        </div>

        {/* Dropdown Filter UI layout block */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="statusFilter"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            Filter Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-slate-400 italic">
          Processing terminal active array indices...
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-sm italic text-slate-400">
          No records inside the quotation system partition match this status
          filter configuration currently.
        </p>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => {
            const trueQuotationId = quote?.quotations?.[0]?.id || quote?.id;
            const parentPoId = quote?.purchaseOrderId || quote?.id || "";
            const quoteId = quote?.id || "";
            const supplierName = quote?.supplier?.name || "Unknown Supplier";
            const totalCost = quote?.totalQuotedCost ?? quote?.totalAmount ?? 0;
            const itemsList = quote?.items || [];

            // Extract the direct native status property layout context safely
            const currentStatus = quote?.status || "PENDING";
            const isAlreadyApproved = currentStatus === "APPROVED";

            return (
              <div
                key={quoteId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-slate-800 text-base">
                        {supplierName}
                      </h3>
                      {/* Active Row Status Badge Inline Element */}
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(currentStatus)}`}
                      >
                        {currentStatus.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Quote ID: #{quoteId.slice(0, 8)} | Parent PO Link: #
                      {parentPoId
                        ? parentPoId.slice(0, 8).toUpperCase()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                        isAlreadyApproved
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {isAlreadyApproved
                        ? "Approved Workflow"
                        : "Received Submittal"}
                    </span>
                    <p className="text-base font-extrabold text-slate-950 mt-1">
                      Total Valuation: ${totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                <table className="w-full text-left text-xs text-slate-600 divide-y">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
                      <th className="p-2">Product Description Name</th>
                      <th className="p-2">Proposed Quoted Variant Quantity</th>
                      <th className="p-2">Proposed Unit Wholesale Price</th>
                      <th className="p-2 text-center">Fulfillability State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {itemsList.map((item) => {
                      const isAvailable = item?.isAvailable ?? true;
                      const productName =
                        item?.product?.name || "Unknown Product";
                      const qty = item?.quotedQuantity ?? item?.quantity ?? 0;
                      const price =
                        item?.quotedPrice ?? item?.purchasePrice ?? 0;

                      return (
                        <tr
                          key={item?.id}
                          className={
                            isAvailable
                              ? ""
                              : "bg-red-50 text-slate-400 line-through"
                          }
                        >
                          <td className="p-2 font-medium text-slate-900">
                            {productName}
                          </td>
                          <td className="p-2 font-mono font-semibold">
                            {isAvailable ? `${qty} Units` : "—"}
                          </td>
                          <td className="p-2 font-mono font-semibold text-blue-600">
                            {isAvailable ? `$${price.toFixed(2)}` : "—"}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isAvailable
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {isAvailable
                                ? "AVAILABLE IN STOCK"
                                : "UNAVAILABLE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ACTION BUTTON FOOTER BAR */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApproveQuotation(trueQuotationId)}
                    disabled={submittingId !== null || isAlreadyApproved}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      isAlreadyApproved
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    {submittingId === trueQuotationId
                      ? "Processing..."
                      : isAlreadyApproved
                        ? "Quotation Approved"
                        : "Approve Quotation Order"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
