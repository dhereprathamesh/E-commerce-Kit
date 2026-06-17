// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuthStore } from "../store/authStore";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [validationError, setValidationError] = useState("");

//   const { login, loading, error, clearError } = useAuthStore();
//   const navigate = useNavigate();

//   // Clean up global auth errors when component unmounts or mounts
//   useEffect(() => {
//     clearError();
//   }, [clearError]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setValidationError("");

//     if (!email || !password) {
//       setValidationError("All fields are required.");
//       return;
//     }

//     const result = await login(email, password);
//     if (result.success) {
//       navigate("/"); // Redirect to homepage or user profile dashboard
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="text-3xl font-bold tracking-tight text-slate-900">
//             Welcome Back
//           </h2>
//           <p className="mt-2 text-sm text-slate-600">
//             Don&apos;t have an account?{" "}
//             <Link
//               to="/register"
//               className="font-medium text-blue-600 hover:underline"
//             >
//               Sign up
//             </Link>
//           </p>
//         </div>

//         {/* Form Container */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {/* Error Feedbacks */}
//           {(validationError || error) && (
//             <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
//               {validationError || error}
//             </div>
//           )}

//           <div className="space-y-4 rounded-md shadow-sm">
//             <div>
//               <label
//                 htmlFor="email-address"
//                 className="block text-sm font-medium text-slate-700 mb-1"
//               >
//                 Email Address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-slate-700"
//                 >
//                   Password
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="text-xs text-blue-600 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                 placeholder="••••••••"
//               />
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative flex w-full justify-center rounded-md bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:bg-slate-400 transition-colors duration-200"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const { loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);

    if (result.success) {
      // Fetch the updated user state straight from the store to ensure fresh data
      const freshUser = useAuthStore.getState().user;

      if (freshUser?.role === "ADMIN") {
        // Force routing straight to backoffice operations
        navigate("/admin/dashboard", { replace: true });
      } else {
        // If they were trying to access a specific page before logging in, send them back
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 bg-white border border-slate-200 rounded-lg mt-12 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-slate-900">Sign In</h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded p-2 font-medium text-sm disabled:bg-slate-400"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
