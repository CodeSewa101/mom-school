import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../image/mom-School.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoveringAdmin, setIsHoveringAdmin] = useState(false);
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
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.img
              src={logo}
              alt="School of Excellency, Aska Alado"
              className="h-16 object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-1 py-2 text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname === item.path ? "text-blue-600 font-medium" : ""
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"
                    layoutId="underline"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}

            {currentUser ? (
              <div 
                className="relative"
                onMouseEnter={() => setIsHoveringAdmin(true)}
                onMouseLeave={() => setIsHoveringAdmin(false)}
              >
                <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 group">
                  <User className="h-4 w-4" />
                  <span>Admin</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isHoveringAdmin ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isHoveringAdmin && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuVariants}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <Link
                        to="/admin"
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Admin Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, height: 0 },
                visible: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2 bg-white border-t border-gray-100">
                {navItems.map((item) => (
                  <motion.div
                    key={item.name}
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={item.path}
                      className={`block px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors ${
                        location.pathname === item.path
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {currentUser ? (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="pt-2 space-y-2 border-t border-gray-100"
                  >
                    <Link
                      to="/admin"
                      className="block px-3 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <Link
                      to="/login"
                      className="block px-3 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}