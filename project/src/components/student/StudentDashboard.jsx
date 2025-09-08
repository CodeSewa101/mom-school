import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  LogOut,
  User,
  Clock,
  Award,
  BarChart3,
  FileText,
  Bell,
  Home,
  Bookmark,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../../config/firebase";

export default function StudentDashboard({ student, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalClasses: 0,
    classesAttended: 0,
    attendancePercentage: 0,
    averageGrade: 0,
  });

  // Add state to track if student data is available
  const [hasStudentData, setHasStudentData] = useState(false);

  useEffect(() => {
    if (student && student.id) {
      console.log("Student data received:", student);
      setHasStudentData(true);
      fetchStudentData();
    } else {
      console.error("No student data provided to dashboard");
      setLoading(false);
      setHasStudentData(false);
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for student:", student.id);

      // Fetch attendance records
      const attendanceRef = collection(db, "attendance");
      const attendanceQuery = query(
        attendanceRef,
        where("studentId", "==", student.id),
        orderBy("date", "desc"),
        limit(10)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Attendance data:", attendanceData);
      setAttendance(attendanceData);

      // Calculate attendance stats
      const totalClasses = attendanceData.length;
      const classesAttended = attendanceData.filter(
        (a) => a.status === "present"
      ).length;
      const attendancePercentage =
        totalClasses > 0
          ? Math.round((classesAttended / totalClasses) * 100)
          : 0;

      // Fetch grades
      const gradesRef = collection(db, "grades");
      const gradesQuery = query(
        gradesRef,
        where("studentId", "==", student.id),
        orderBy("subject")
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      const gradesData = gradesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Grades data:", gradesData);
      setGrades(gradesData);

      // Calculate average grade
      const numericGrades = gradesData
        .filter((g) => !isNaN(parseFloat(g.grade)))
        .map((g) => parseFloat(g.grade));
      const averageGrade =
        numericGrades.length > 0
          ? (
              numericGrades.reduce((sum, grade) => sum + grade, 0) /
              numericGrades.length
            ).toFixed(1)
          : "N/A";

      // Fetch timetable
      const timetableRef = collection(db, "timetable");
      const timetableQuery = query(
        timetableRef,
        where("class", "==", student.class),
        where("section", "==", student.section),
        orderBy("dayOfWeek"),
        orderBy("period")
      );
      const timetableSnapshot = await getDocs(timetableQuery);
      const timetableData = timetableSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Timetable data:", timetableData);
      setTimetable(timetableData);

      // Fetch assignments
      const assignmentsRef = collection(db, "assignments");
      const assignmentsQuery = query(
        assignmentsRef,
        where("class", "==", student.class),
        where("section", "==", student.section),
        orderBy("dueDate", "desc"),
        limit(5)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Assignments data:", assignmentsData);
      setAssignments(assignmentsData);

      // Fetch announcements
      const announcementsRef = collection(db, "announcements");
      const announcementsQuery = query(
        announcementsRef,
        orderBy("date", "desc"),
        limit(5)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Announcements data:", announcementsData);
      setAnnouncements(announcementsData);

      // Set stats
      setStats({
        totalClasses,
        classesAttended,
        attendancePercentage,
        averageGrade,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setLoading(false);
    }
  };

  const getDayName = (dayNumber) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNumber] || "Unknown";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium">Attendance</h3>
                    <p className="text-2xl font-bold">
                      {stats.attendancePercentage}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs opacity-80">
                  {stats.classesAttended} of {stats.totalClasses} classes
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg text-white">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium">Average Grade</h3>
                    <p className="text-2xl font-bold">{stats.averageGrade}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-xl shadow-lg text-white">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium">Subjects</h3>
                    <p className="text-2xl font-bold">
                      {
                        [...new Set(grades.map((grade) => grade.subject))]
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-xl shadow-lg text-white">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium">Pending Assignments</h3>
                    <p className="text-2xl font-bold">
                      {
                        assignments.filter((a) => {
                          const dueDate = a.dueDate?.toDate();
                          return dueDate && dueDate > new Date();
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Attendance Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                  Recent Attendance
                </h3>
                {attendance.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {attendance.slice(0, 10).map((record) => (
                      <div
                        key={record.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <span className="text-gray-700 block">
                            {formatDate(record.date)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {record.subject || "General"}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4 text-center">
                    No attendance records found.
                  </p>
                )}
              </div>

              {/* Grades Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-500" />
                  Grades
                </h3>
                {grades.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-gray-700">{grade.subject}</span>
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">
                            {grade.grade}
                          </span>
                          {grade.maxGrade && (
                            <span className="text-xs text-gray-500">
                              / {grade.maxGrade}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4 text-center">
                    No grades available yet.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Assignments Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                  Recent Assignments
                </h3>
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const dueDate = assignment.dueDate?.toDate();
                      const isOverdue = dueDate && dueDate < new Date();
                      const isUpcoming = dueDate && dueDate > new Date();

                      return (
                        <div
                          key={assignment.id}
                          className={`p-3 rounded-lg border ${
                            isOverdue
                              ? "bg-red-50 border-red-200"
                              : isUpcoming
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {assignment.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {assignment.subject}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isOverdue
                                  ? "bg-red-100 text-red-800"
                                  : isUpcoming
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {dueDate
                                ? formatDate(assignment.dueDate)
                                : "No due date"}
                            </span>
                          </div>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4 text-center">
                    No assignments available.
                  </p>
                )}
              </div>

              {/* Announcements Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-indigo-500" />
                  Announcements
                </h3>
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {announcement.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(announcement.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {announcement.message}
                        </p>
                        {announcement.author && (
                          <p className="text-xs text-gray-500 mt-2">
                            - {announcement.author}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4 text-center">
                    No announcements available.
                  </p>
                )}
              </div>
            </div>
          </>
        );

      case "timetable":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-indigo-500" />
              Weekly Timetable
            </h3>
            {timetable.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day/Period
                      </th>
                      {[...Array(8)].map((_, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Period {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[0, 1, 2, 3, 4, 5].map((day) => {
                      const dayTimetable = timetable.filter(
                        (item) => item.dayOfWeek === day
                      );
                      return (
                        <tr key={day}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getDayName(day)}
                          </td>
                          {[...Array(8)].map((_, period) => {
                            const subject = dayTimetable.find(
                              (item) => item.period === period + 1
                            );
                            return (
                              <td
                                key={period}
                                className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500"
                              >
                                {subject ? subject.subject : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">
                Timetable not available.
              </p>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-500" />
              Student Profile
            </h3>

            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <img
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                  src={
                    student?.photo ||
                    "https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=100"
                  }
                  alt={student?.name || "Student"}
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">
                  {student?.name || "No Name Provided"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center text-gray-600">
                    <GraduationCap className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>
                      Class {student?.class || "N/A"} - Section{" "}
                      {student?.section || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>Roll No: {student?.rollNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>{student?.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2 text-indigo-500" />
                    <span>{student?.phone || "N/A"}</span>
                  </div>
                  {student?.birthDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                      <span>DOB: {formatDate(student.birthDate)}</span>
                    </div>
                  )}
                  {student?.bloodGroup && (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2 text-indigo-500">🩸</span>
                      <span>Blood Group: {student.bloodGroup}</span>
                    </div>
                  )}
                  {student?.address && (
                    <div className="flex items-center text-gray-600 md:col-span-2">
                      <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                      <span>{student.address}</span>
                    </div>
                  )}
                </div>

                {/* Parent Information */}
                {(student?.parentName || student?.parentPhone) && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.parentName && (
                        <div className="flex items-center text-gray-600">
                          <User className="h-5 w-5 mr-2 text-indigo-500" />
                          <span>{student.parentName}</span>
                        </div>
                      )}
                      {student.parentPhone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-5 w-5 mr-2 text-indigo-500" />
                          <span>{student.parentPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasStudentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Student Data Not Available
          </h2>
          <p className="text-gray-600 mb-6">Please try logging in again.</p>
          <button
            onClick={onLogout}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-8 w-8 text-indigo-600" />
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {student?.name || "Student"}!
            </p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2 mt-4 md:mt-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === "overview"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === "timetable"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Timetable</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === "profile"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
