import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  // --- States ---
  const [step, setStep] = useState(1); // 1 = Register Form, 2 = OTP Verification
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));

  // --- Modal State ---
  const [modal, setModal] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // --- Store & Navigation ---
  const {
    register,
    verifyOtp,
    sendVerificationOtp,
    loading,
    error,
    clearError,
  } = useAuthStore();
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // --- Handlers ---

  // 1. Handle Initial Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!name || !email || !password) {
      setValidationError("All fields are required.");
      return;
    }

    // Enforces: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setValidationError(
        "Password must be at least 8 characters long and include uppercase and lowercase letters, numbers, and symbols."
      );
      return;
    }

    const result = await register(name, email, password);

    if (result?.success) {
      setModal({
        isOpen: true,
        type: "success",
        title: "Registration Successful!",
        message:
          "We have sent a 6-digit verification code to your email address.",
        onConfirm: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
          setStep(2); // Move to OTP layout
        },
      });
    } else {
      setModal({
        isOpen: true,
        type: "error",
        title: "Registration Failed",
        message:
          result?.error || "Could not complete registration. Please try again.",
        onConfirm: () => setModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  // 2. Handle OTP Input Changes
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // 3. Handle Backspace on OTP
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // 4. Handle OTP Submission
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setValidationError("Please enter the complete 6-digit code.");
      return;
    }

    const result = await verifyOtp(email, otpCode);
    if (result?.success) {
      setModal({
        isOpen: true,
        type: "success",
        title: "Account Verified!",
        message: "Your email has been confirmed successfully. Welcome aboard!",
        onConfirm: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
          navigate("/"); // Direct to home page
        },
      });
    } else {
      setModal({
        isOpen: true,
        type: "error",
        title: "Verification Failed",
        message: error || "The verification code is incorrect or expired.",
        onConfirm: () => setModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  // 5. Handle Resend Code
  const handleResendCode = async () => {
    setValidationError("");
    setOtp(new Array(6).fill(""));
    otpInputRefs.current[0]?.focus();

    const result = await sendVerificationOtp(email);
    if (result?.success) {
      setModal({
        isOpen: true,
        type: "success",
        title: "Code Resent",
        message: "A fresh verification code has been fired to your mailbox.",
        onConfirm: () => setModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };
  {/* FIXED WRAPPER: Explicitly tracks remaining viewport height minus navbar to center content perfectly */}
  return (
    <div className="flex min-h-[calc(100vh-170px)] items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* --- STEP 1: REGISTRATION FORM --- */}
        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create an Account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
              {validationError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {validationError}
                </div>
              )}

              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    type="text" // Changed from email to prevent browser validation fighting custom backend schemas
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:bg-slate-400 transition-colors duration-200"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* --- STEP 2: EMAIL VERIFICATION (OTP) --- */}
        {step === 2 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Verify your email
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;ve sent a 6-digit verification code to <br />
                <span className="font-semibold text-slate-900">{email}</span>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleVerifySubmit}>
              {validationError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {validationError}
                </div>
              )}

              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-md border border-slate-300 bg-white text-center text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:bg-slate-400 transition-colors duration-200"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>

                <div className="text-center text-sm">
                  <span className="text-slate-600">
                    Didn&apos;t receive the code?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline disabled:text-slate-400 disabled:no-underline"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      {/* --- RESPONSIVE INTERMEDIATE MODAL --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 text-center shadow-xl transition-all">
            {/* Modal Conditional Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14">
              {modal.type === "success" ? (
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

            {/* Modal Copy text */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900 leading-6">
                {modal.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{modal.message}</p>
            </div>

            {/* Modal Confirm button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={modal.onConfirm}
                className={`w-full inline-flex justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  modal.type === "success"
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}