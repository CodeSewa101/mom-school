import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  Camera,
  Settings,
  Menu,
  X,
  LogOut,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Classes & Subjects', path: '/admin/classes', icon: BookOpen },
    { name: 'Attendance', path: '/admin/attendance', icon: Clock },
    { name: 'Exams & Results', path: '/admin/exams', icon: Award },
    { name: 'Fee Management', path: '/admin/fees', icon: DollarSign },
    { name: 'Timetable', path: '/admin/timetable', icon: Calendar },
    { name: 'Homework & Notices', path: '/admin/homework', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Photo Gallery', path: '/admin/gallery', icon: Camera },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-20 lg:w-64 bg-indigo-700 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-indigo-600">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="hidden lg:block text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-2 lg:px-3">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center p-3 lg:px-3 lg:py-2 rounded-lg transition-colors group ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
                title={item.name}
              >
                <item.icon className="h-6 w-6 mx-auto lg:mr-3 lg:ml-0" />
                <span className="hidden lg:block text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-indigo-600">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 lg:px-3 lg:py-2 text-red-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors group"
              title="Logout"
            >
              <LogOut className="h-6 w-6 mx-auto lg:mr-3 lg:ml-0" />
              <span className="hidden lg:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Admin</span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}