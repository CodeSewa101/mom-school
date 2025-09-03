import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, School, Calendar } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'student'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    dob: "", // Date of birth field for student login
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser, login, loading, userRole } = useAuth(); // Assuming your AuthContext provides userRole
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !loading) {
      // Redirect based on actual user role from authentication
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "student") {
        navigate("/student", { replace: true });
      }
    }
  }, [currentUser, loading, navigate, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on login type
    if (loginType === "student") {
      const { password, dob } = formData;
      if (!password || !dob) {
        toast.error("Please fill in all fields");
        return;
      }
    } else {
      const { email, password } = formData;
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (loginType === "student") {
        // Student login logic - you'll need to implement this
        // This would typically call a different authentication method
        // that uses date of birth and password instead of email

        // For now, let's simulate a successful student login
        // In a real implementation, you would call your student login API
        // and the AuthContext would update the userRole accordingly
        toast.success("Student login successful!");
        // In a real app, you would set user role in your auth context
        // For this example, we'll assume the auth context handles this
      } else {
        await login(formData.email, formData.password);
        toast.success("Admin login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.message.includes("Access denied")) {
        toast.error(
          `${loginType === "admin" ? "Admin" : "Student"} privileges required`
        );
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Account temporarily locked. Try again later");
      } else {
        toast.error("Login failed: " + error.message);
      }
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            {loginType === "admin" ? "Admin Portal" : "Student Portal"}
          </h1>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Login Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loginType === "admin"
                ? "bg-white shadow-sm text-blue-600 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setLoginType("admin")}
          >
            <School className="h-5 w-5" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
              loginType === "student"
                ? "bg-white shadow-sm text-blue-600 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setLoginType("student")}
          >
            <School className="h-5 w-5" />
            <span>Student</span>
          </button>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field - Only for Admin Login */}
            {loginType === "admin" && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <School className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required={loginType === "admin"}
                    value={formData.email}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            )}

            {/* Date of Birth Field - Only for Student Login */}
            {loginType === "student" && (
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required={loginType === "student"}
                    value={formData.dob}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
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
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
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

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        </div>
      </div>
    </div>
  );
}
