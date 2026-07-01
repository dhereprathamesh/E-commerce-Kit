import Navbar from "./Navbar";
import Footer from "./Footer";

// eslint-disable-next-line react/prop-types
export default function Layout({ children }) {
  console.log("Layout.js");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {/* {location.pathname === "/" && <CategoryNavbar />} */}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
