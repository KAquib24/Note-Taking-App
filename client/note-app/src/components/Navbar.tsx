import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  onSearch?: (query: string, filter: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 👈 default: all fields
  const navigate = useNavigate(); // ✅ use hook

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearch) {
      onSearch(value, filter);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilter(value);
    if (onSearch) {
      onSearch(search, value);
    }
  };

  return (
    <nav className="p-4 flex flex-wrap justify-between items-center bg-gray-900 text-white shadow-lg">
      {/* Left side: Links */}
      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="font-bold text-lg">
          📝 Notes App
        </Link>
        {token && (
          <>
            <Link to="/add-note" className="hover:underline">
              Add Note
            </Link>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <button
              onClick={() => navigate("/stylus")}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Stylus Notes
            </button>
          </>
        )}
      </div>

      {/* 🔎 Search Bar */}
      {token && (
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={handleSearchChange}
            className="px-3 py-1 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="px-2 py-1 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="title">Title</option>
            <option value="content">Content</option>
            <option value="tags">Tags</option>
          </select>
        </div>
      )}

      {/* Right side: Auth */}
      {token ? (
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md ml-4"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md ml-4"
        >
          Login
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
