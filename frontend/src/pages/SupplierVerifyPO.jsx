import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function SupplierVerifyPO() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1); // 1: Email Verification, 2: OTP Entry, 3: Quotation Checklist, 4: Complete
  const [email, setEmail] = useState("");
  const [poId, setPoId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [itemsForm, setItemsForm] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/purchase-orders/request-otp", {
        token,
        email,
      });

      // Adjusted to use your global wrapper structure (.data.data)
      const responseData = res.data.data || res.data;
      setPoId(responseData.poId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid target parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/purchase-orders/verify-otp", {
        poId,
        otpCode,
      });

      // Adjusted to pull your purchaseOrder object out safely from the global wrapper setup
      const responseData = res.data.data || res.data;
      const purchaseOrder = responseData.purchaseOrder || responseData;

      const initialForm = (purchaseOrder.items || []).map((item) => ({
        productId: item.productId,
        productName: item.product?.name || "Unknown Product",
        requestedQty: item.quantity,
        requestedPrice: item.purchasePrice,
        quotedQuantity: item.quantity,
        quotedPrice: item.purchasePrice,
        isAvailable: true,
      }));

      setItemsForm(initialForm);
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid token matching confirmation step.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormIndex = (index, key, val) => {
    const copy = [...itemsForm];
    copy[index][key] = val;
    setItemsForm(copy);
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/purchase-orders/submit-quotation", {
        poId,
        items: itemsForm,
      });
      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed execution context routing layout.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        {error && (
          <div className="mb-4 rounded bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {step === 1 && (
          <form
            onSubmit={handleEmailSubmit}
            className="space-y-4 max-w-md mx-auto"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Identity Verification Gateway
            </h2>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered company email address"
              className="w-full border px-3 py-2 text-sm rounded outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded text-sm font-semibold"
            >
              {loading ? "Processing..." : "Send Secure OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleOtpSubmit}
            className="space-y-4 max-w-md mx-auto"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Verify Code Credentials
            </h2>
            <input
              type="text"
              maxLength={6}
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="000000"
              className="w-full text-center tracking-widest text-lg font-mono border px-3 py-2 rounded outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded text-sm font-semibold"
            >
              Confirm Entry Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFormSubmission} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Configure Cost Quotation Form
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="p-3 text-center">Fulfill</th>
                    <th className="p-3">Product Description</th>
                    <th className="p-3">Requested Target</th>
                    <th className="p-3">Quoted Qty</th>
                    <th className="p-3">Quoted Price ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itemsForm.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        item.isAvailable
                          ? ""
                          : "bg-slate-50 text-slate-400 opacity-60"
                      }
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(e) =>
                            updateFormIndex(
                              idx,
                              "isAvailable",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                        />
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="p-3 text-xs text-slate-500">
                        Qty: {item.requestedQty} <br /> Target: $
                        {item.requestedPrice.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          disabled={!item.isAvailable}
                          value={item.quotedQuantity}
                          onChange={(e) =>
                            updateFormIndex(
                              idx,
                              "quotedQuantity",
                              e.target.value,
                            )
                          }
                          className="w-24 border rounded px-2 py-1 text-sm text-slate-900 focus:outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          disabled={!item.isAvailable}
                          value={item.quotedPrice}
                          onChange={(e) =>
                            updateFormIndex(idx, "quotedPrice", e.target.value)
                          }
                          className="w-28 border rounded px-2 py-1 text-sm text-slate-900 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow-sm"
              >
                Submit New Quotation Offer
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="text-center py-6 max-w-sm mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Quotation Dispatched
            </h2>
            <p className="text-sm text-slate-500">
              Your configuration proposal has been securely logged on an
              independent table row layer for the administrative review process
              hierarchy mappings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
