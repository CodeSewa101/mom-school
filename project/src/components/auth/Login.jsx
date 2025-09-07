import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Calendar } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [loginType, setLoginType] = useState("admin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    dob: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser, userData, login, loading, studentLogin } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const navigationTimeout = useRef(null);

  // Debug information
  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("User data:", userData);
    console.log("Loading state:", loading);
    console.log("Has redirected:", hasRedirected.current);
  }, [currentUser, userData, loading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, []);

  // Redirect based on user role - IMPROVED VERSION
  useEffect(() => {
    // Only redirect if we have a user with a role, not loading, and haven't redirected yet
    if (!loading && !hasRedirected.current) {
      // Determine the user's role
      let userRole = null;
      
      if (currentUser && currentUser.role) {
        userRole = currentUser.role;
      } else if (userData && userData.role) {
        userRole = userData.role;
      }

      if (userRole) {
        console.log("Redirecting with role:", userRole);
        hasRedirected.current = true;

        if (navigationTimeout.current) {
          clearTimeout(navigationTimeout.current);
        }

        navigationTimeout.current = setTimeout(() => {
          if (userRole === "admin") {
            console.log("Navigating to /admin");
            navigate("/admin", { replace: true });
          } else if (userRole === "student") {
            console.log("Navigating to /student");
            navigate("/student", { replace: true });
          }
        }, 100);
      }
    }
  }, [currentUser, userData, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset the redirect flag on new login attempt
    hasRedirected.current = false;

    if (loginType === "admin") {
      const { email, password } = formData;

      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      setSubmitting(true);

      try {
        await login(email, password);
        toast.success("Admin login successful!");
      } catch (error) {
        console.error("Login error:", error);

        if (error.code === "auth/invalid-email") {
          toast.error("Invalid email address");
        } else if (error.code === "auth/user-disabled") {
          toast.error("Account has been disabled");
        } else if (error.code === "auth/user-not-found") {
          toast.error("No account found with this email");
        } else if (error.code === "auth/wrong-password") {
          toast.error("Incorrect password");
        } else {
          toast.error("Login failed: " + error.message);
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      const { dob, password } = formData;

      if (!dob || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      setSubmitting(true);

      try {
        await studentLogin(dob, password);
        toast.success("Student login successful!");
      } catch (error) {
        console.error("Student login error:", error);

        if (error.message === "Student not found") {
          toast.error("No student found with this date of birth");
        } else if (error.message === "Invalid credentials") {
          toast.error("Incorrect password");
        } else {
          toast.error("Login failed: " + error.message);
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Education Portal
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h2 className="text-xl font-bold text-white text-center">
              Sign in to your account
            </h2>
          </div>

          <div className="p-6">
            {/* Login type selector */}
            <div className="mb-6">
              <div className="flex rounded-lg shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setLoginType("admin")}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-l-lg ${
                    loginType === "admin"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("student")}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-r-lg ${
                    loginType === "student"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                >
                  Student Login
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {loginType === "admin" ? (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date of Birth
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        required
                        value={formData.dob}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${loginType}`
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/contact"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Need help? Contact administrator
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Education Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}