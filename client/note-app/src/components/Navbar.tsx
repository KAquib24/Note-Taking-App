import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  onSearch?: (query: string, filter: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold tracking-tight"
            >
              <div className="bg-white p-1.5 rounded-lg">
                <span className="text-indigo-600">📝</span>
              </div>
              <span className="hidden sm:inline">NotesApp</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {token && (
            <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
              {/* Search Bar */}
              <div className="relative flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/20">
                <svg 
                  className="w-5 h-5 text-white/70 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-transparent border-none text-white placeholder-white/70 focus:ring-0 px-2 py-1 w-40 lg:w-56 outline-none"
                />
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="bg-indigo-700 border-none text-white rounded-md px-2 py-1 ml-2 focus:ring-2 focus:ring-white/30 outline-none"
                >
                  <option value="all">All</option>
                  <option value="title">Title</option>
                  <option value="content">Content</option>
                  <option value="tags">Tags</option>
                </select>
              </div>
            </div>
          )}

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <>
                <Link
                  to="/add-note"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Note
                </Link>
                
                <button
                  onClick={() => navigate("/stylus")}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Stylus
                </button>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-white text-indigo-600 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {token && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && token && (
          <div className="md:hidden bg-indigo-700 border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="flex flex-col space-y-2 px-2">
                <div className="relative flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/20">
                  <svg 
                    className="w-5 h-5 text-white/70" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={handleSearchChange}
                    className="bg-transparent border-none text-white placeholder-white/70 focus:ring-0 px-2 py-1 flex-1 outline-none"
                  />
                </div>
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="bg-indigo-600 border-none text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-white/30 outline-none w-full"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title</option>
                  <option value="content">Content</option>
                  <option value="tags">Tags</option>
                </select>
              </div>

              {/* Mobile Navigation Links */}
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              <Link
                to="/add-note"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Note
              </Link>
              
              <button
                onClick={() => {
                  navigate("/stylus");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
              >
                Stylus Notes
              </button>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors text-red-200 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;