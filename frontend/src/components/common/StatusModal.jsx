/* eslint-disable react/prop-types */
export default function StatusModal({
  isOpen,
  type = "success",
  title,
  message,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm !mt-0">
      <div className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 text-center shadow-xl transition-all">
        {/* Dynamic Status Icon (Success vs Error) */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14">
          {type === "success" ? (
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Modal Text Content */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 leading-6">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full inline-flex justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              type === "success"
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
