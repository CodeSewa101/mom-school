import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/common/ProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import StudentManagement from "./components/admin/StudentManagement";
import TeacherManagement from "./components/admin/TeacherManagement";
import NotificationManagement from "./components/admin/NotificationManagement";
import PhotoGallery from "./components/admin/PhotoGallery";
import Timetable from "./pages/Timetable"; // Admin version
import TimetableView from "./pages/TimetableView"; // Public version
import HomeworkPage from "./pages/HomeworkPage";
import AttendancePage from "./pages/AttendancePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <About />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/gallery"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Gallery />
                </main>
                <Footer />
              </div>
            }
          />
          {/* Add the public timetable route */}
          <Route
            path="/timetable"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <TimetableView />
                </main>
                <Footer />
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route
                path="notifications"
                element={<NotificationManagement />}
              />
              <Route path="gallery" element={<PhotoGallery />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="attendance" element={<AttendancePage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
