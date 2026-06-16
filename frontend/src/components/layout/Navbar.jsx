import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">
        E-Commerce
      </Link>

      <nav className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
      </nav>
    </header>
  );
}
