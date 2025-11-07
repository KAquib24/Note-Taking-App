import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface NavbarProps {
  onSearch?: (query: string, filter: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const { token, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync dark mode with dashboard
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">🐐</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                NOTES
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {token && (
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center max-w-2xl mx-8">
              {/* Search Bar */}
              <div className="relative flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/50 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all duration-300 shadow-inner">
                <svg 
                  className="w-4 h-4 text-gray-400 ml-3" 
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
                  placeholder="Search masterpieces..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 px-3 py-2 w-48 xl:w-64 outline-none text-sm font-medium"
                />
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="bg-white/40 dark:bg-gray-700/40 border-l border-white/30 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-r-xl px-2 py-2 focus:ring-0 outline-none appearance-none pr-6 text-xs font-medium"
                >
                  <option value="all">All</option>
                  <option value="title">Title</option>
                  <option value="content">Content</option>
                  <option value="tags">Tags</option>
                  <option value="folder">Workspace</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-2">
            {token ? (
              <>
                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActiveRoute("/dashboard")
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/add-note"
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActiveRoute("/add-note")
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  + Create
                </Link>
                
                <button
                  onClick={() => navigate("/stylus")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActiveRoute("/stylus")
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  Canvas
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:scale-105"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all duration-300 border border-red-200 dark:border-red-800/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {token && (
              <>
                {/* Mobile Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-gray-300"
                >
                  {darkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <svg
                    className="h-5 w-5"
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
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {token && (
          <div className="lg:hidden pb-3">
            <div className="relative flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-600/50 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all duration-300 shadow-inner">
              <svg 
                className="w-4 h-4 text-gray-400 ml-3" 
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
                placeholder="Search masterpieces..."
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 px-3 py-2 flex-1 outline-none text-sm font-medium"
              />
              <select
                value={filter}
                onChange={handleFilterChange}
                className="bg-white/40 dark:bg-gray-700/40 border-l border-white/30 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 rounded-r-xl px-2 py-2 focus:ring-0 outline-none appearance-none pr-6 text-xs font-medium"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
                <option value="content">Content</option>
                <option value="tags">Tags</option>
                <option value="folder">Workspace</option>
              </select>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && token && (
          <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 rounded-b-2xl shadow-2xl absolute left-0 right-0 top-16 z-50">
            <div className="px-3 pt-2 pb-4 space-y-1">
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActiveRoute("/dashboard")
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              <Link
                to="/add-note"
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActiveRoute("/add-note")
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                + Create Note
              </Link>
              
              <button
                onClick={() => {
                  navigate("/stylus");
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActiveRoute("/stylus")
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                }`}
              >
                Canvas Notes
              </button>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all duration-300 border border-red-200 dark:border-red-800/30"
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