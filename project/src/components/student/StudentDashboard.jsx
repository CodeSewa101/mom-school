import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  Award,
  BarChart3,
  Bell,
  UserCheck,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState(0);
  const [assignmentsDue, setAssignmentsDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!currentUser) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        let studentId;
        
        // Handle both Firebase users and student users
        if (currentUser.role === "student") {
          // This is a student user from our custom login
          studentId = currentUser.uid;
          // Set student data from userData if available
          if (userData) {
            setStudentData(userData);
            await fetchStudentAdditionalData(userData);
          } else {
            // Fetch student data from Firestore using the UID
            const studentDoc = await getDoc(doc(db, "students", studentId));
            if (studentDoc.exists()) {
              const data = { id: studentDoc.id, ...studentDoc.data() };
              setStudentData(data);
              await fetchStudentAdditionalData(data);
            }
          }
        } else {
          // This is a Firebase user (for admin, but students shouldn't be here)
          console.error("Invalid user type");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };

    const fetchStudentAdditionalData = async (studentData) => {
      try {
        // Fetch timetable for student's class
        if (studentData.class && studentData.section) {
          const timetableRef = collection(db, "timetables");
          const timetableQuery = query(
            timetableRef,
            where("class", "==", studentData.class),
            where("section", "==", studentData.section)
          );
          const timetableSnapshot = await getDocs(timetableQuery);

          if (!timetableSnapshot.empty) {
            const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const days = [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ];
            const todaySchedule =
              timetableSnapshot.docs[0].data()[days[today]] || [];
            setTimetable(todaySchedule);
          }
        }

        // Fetch attendance data
        const attendanceRef = collection(db, "attendance");
        const attendanceQuery = query(
          attendanceRef,
          where("studentId", "==", studentData.id || studentData.uid),
          where("month", "==", new Date().getMonth() + 1), // Current month
          where("year", "==", new Date().getFullYear()) // Current year
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        if (!attendanceSnapshot.empty) {
          const attendanceData = attendanceSnapshot.docs[0].data();
          const totalDays = attendanceData.totalDays || 1;
          const presentDays = attendanceData.presentDays || 0;
          const attendancePercentage = Math.round(
            (presentDays / totalDays) * 100
          );
          setAttendance(attendancePercentage);
        }

        // Fetch assignments due
        const assignmentsRef = collection(db, "assignments");
        const currentDate = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(currentDate.getDate() + 3);

        const assignmentsQuery = query(
          assignmentsRef,
          where("dueDate", ">=", currentDate),
          where("dueDate", "<=", threeDaysLater),
          where("class", "==", studentData.class)
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        setAssignmentsDue(assignmentsSnapshot.size);
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
    };

    fetchStudentData();
  }, [currentUser, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 h-32 shadow-sm"
                ></div>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {studentData?.name || "Student"}! Here's your schedule
            for today.
          </p>
          {studentData && (
            <p className="text-sm text-gray-500 mt-1">
              Class {studentData.class} - Section {studentData.section}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">
                  Today's Classes
                </p>
                <p className="text-2xl font-bold mt-2">{timetable.length}</p>
                <p className="text-sm text-blue-200 mt-1">
                  {timetable.length > 0
                    ? "Check schedule below"
                    : "No classes today"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white bg-opacity-20">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-green-500 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Attendance</p>
                <p className="text-2xl font-bold mt-2">{attendance}%</p>
                <p className="text-sm text-green-200 mt-1">This month</p>
              </div>
              <div className="p-3 rounded-xl bg-white bg-opacity-20">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-amber-500 rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">
                  Assignments Due
                </p>
                <p className="text-2xl font-bold mt-2">{assignmentsDue}</p>
                <p className="text-sm text-amber-200 mt-1">Next 3 days</p>
              </div>
              <div className="p-3 rounded-xl bg-white bg-opacity-20">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Timetable */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              Today's Schedule
            </h2>
            {timetable.length > 0 ? (
              <div className="space-y-4">
                {timetable.map((classItem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {classItem.subject}
                        </p>
                        <p className="text-sm text-gray-600">
                          {classItem.teacher}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border">
                      {classItem.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>

          {/* Quick Links and Notices */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Links
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/student/homework")}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-600">
                    Study Materials
                  </span>
                </button>
                <button
                  onClick={() => (window.location.href = "/student/results")}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">
                    Grades & Results
                  </span>
                </button>
                <button
                  onClick={() => (window.location.href = "/timetable")}
                  className="w-full flex items-center space-x-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-600">
                    Academic Calendar
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 text-purple-600 mr-2" />
                Recent Notices
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm font-medium text-purple-900">
                    Annual Sports Day
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Posted 2 days ago
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-blue-900">
                    Parent-Teacher Meeting
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Posted 5 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}