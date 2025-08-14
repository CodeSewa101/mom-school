import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../image/mom-School.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const AdminIcon = ({ isOpen = false }) => (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1.5"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </motion.svg>
  );

  const GlassBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-[3px]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent"></div>
    </div>
  );

  return (
    <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200/50 shadow-sm relative">
      <GlassBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="MOM School of Excellency"
                  className="h-12 object-contain"
                />
              </div>

              <div className="hidden sm:block relative ml-3">
                <motion.h1 className="font-bold text-xl tracking-tight">
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MOM SCHOOL OF EXCELLENCY
                  </span>
                  <span className="text-xs tracking-wider font-medium text-gray-500 uppercase">
                    
                  </span>
                </motion.h1>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 font-medium text-sm transition-colors ${
                  location.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                      layoutId="underline"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </span>
              </Link>
            ))}

            {/* Admin Dropdown */}
            {currentUser ? (
              <div className="relative ml-4">
                <motion.button
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-gray-200 bg-white hover:bg-gray-50 shadow-xs transition-all"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                >
                  <span className="relative z-10 flex items-center text-gray-800">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
                      👤
                    </span>
                    Admin
                    <AdminIcon isOpen={isAdminDropdownOpen} />
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isAdminDropdownOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuVariants}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      onMouseLeave={() => setIsAdminDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500">Logged in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        to="/admin"
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 transition-all flex items-center text-sm border-b border-gray-100"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        <span className="w-5 mr-3 text-blue-500">📊</span>
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 transition-all flex items-center text-sm border-b border-gray-100"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        <span className="w-5 mr-3 text-blue-500">⚙️</span>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsAdminDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all flex items-center text-sm"
                      >
                        <span className="w-5 mr-3">🔓</span>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="ml-4 relative"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="mr-2">🔑</span> Admin Login
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md relative group"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-between items-center relative">
                <motion.span
                  className="h-[2px] w-full bg-gray-600 rounded-full origin-center"
                  animate={{
                    y: isMenuOpen ? 8 : 0,
                    rotate: isMenuOpen ? 45 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="h-[2px] bg-gray-600 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    width: isMenuOpen ? "0%" : "80%",
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="h-[2px] w-full bg-gray-600 rounded-full origin-center"
                  animate={{
                    y: isMenuOpen ? -8 : 0,
                    rotate: isMenuOpen ? -45 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 py-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-gray-200/30 rounded-b-lg shadow-lg">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                    }}
                  >
                    <Link
                      to={item.path}
                      className={`block px-4 py-2.5 rounded-md transition-all text-sm ${
                        location.pathname === item.path
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {currentUser ? (
                  <>
                    <div className="pt-2 mt-2 border-t border-gray-200/30">
                      <div className="px-4 py-2.5 text-xs text-gray-500">
                        Admin Panel
                      </div>
                      <Link
                        to="/admin"
                        className="block px-4 py-2.5 rounded-md text-gray-700 hover:bg-blue-50 transition-all text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="block px-4 py-2.5 rounded-md text-gray-700 hover:bg-blue-50 transition-all text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 rounded-md text-red-600 hover:bg-red-50 transition-all text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="pt-2 mt-2 border-t border-gray-200/30">
                    <Link
                      to="/login"
                      className="block text-center px-4 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
