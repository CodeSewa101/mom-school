import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  Calendar,
  TrendingUp,
  UserCheck,
  BookOpen,
  Bell
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, isToday } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalFees: 0,
    birthdaysToday: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const totalStudents = studentsSnapshot.size;

      // Count today's birthdays
      const today = format(new Date(), 'MM-dd');
      let birthdaysToday = 0;
      studentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.birthDate) {
          const birthDate = new Date(data.birthDate);
          if (isToday(birthDate)) {
            birthdaysToday++;
          }
        }
      });

      // Fetch teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const totalTeachers = teachersSnapshot.size;

      // Calculate total fees (placeholder - would need fee records)
      const totalFees = 125000; // Mock data

      setStats({
        totalStudents,
        totalTeachers,
        totalFees,
        birthdaysToday
      });

      // Mock recent activities
      setRecentActivities([
        { id: 1, type: 'student', message: 'New student John Doe registered', time: '2 hours ago' },
        { id: 2, type: 'fee', message: 'Fee payment received from Jane Smith', time: '4 hours ago' },
        { id: 3, type: 'attendance', message: 'Attendance marked for Grade 5A', time: '6 hours ago' },
        { id: 4, type: 'announcement', message: 'New announcement posted', time: '1 day ago' }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+3%'
    },
    {
      title: 'Total Fees Collected',
      value: `₹${stats.totalFees.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+18%'
    },
    {
      title: 'Birthdays Today',
      value: stats.birthdaysToday,
      icon: Calendar,
      color: 'bg-purple-500',
      change: stats.birthdaysToday > 0 ? '🎉' : '—'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening at your school today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-sm text-green-600 mt-1">{card.change}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-blue-600">Add Student</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <GraduationCap className="h-6 w-6 text-green-600" />
                <span className="font-medium text-green-600">Add Teacher</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <UserCheck className="h-6 w-6 text-yellow-600" />
                <span className="font-medium text-yellow-600">Mark Attendance</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Bell className="h-6 w-6 text-purple-600" />
                <span className="font-medium text-purple-600">Send Notice</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'student' && <Users className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'fee' && <DollarSign className="h-5 w-5 text-green-500" />}
                    {activity.type === 'attendance' && <UserCheck className="h-5 w-5 text-yellow-500" />}
                    {activity.type === 'announcement' && <Bell className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}