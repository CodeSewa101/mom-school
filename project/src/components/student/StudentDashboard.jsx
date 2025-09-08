import React, { useState, useEffect } from "react";
import {
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon,
  TableCellsIcon,
  DocumentTextIcon,
  IdentificationIcon,
  UserGroupIcon,
  AcademicCapIcon as AcademicCapSolid,
} from "@heroicons/react/24/outline";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

const StudentDashboard = () => {
  const { userData, currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [feeStatus, setFeeStatus] = useState({});
  const [results, setResults] = useState({});
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (userData && currentUser) {
      // Use the actual student data from authentication
      const actualStudentData = {
        id: currentUser.uid,
        name: userData.name,
        rollNumber: userData.rollNumber,
        class: userData.class,
        section: userData.section,
        email: userData.email,
        academicYear: userData.academicYear,
        phone: userData.phone,
        address: userData.address,
        birthDate: userData.birthDate,
        parentName: userData.parentName,
        parentPhone: userData.parentPhone,
        photo: userData.photo,
      };

      setStudentData(actualStudentData);
      
      // Fetch additional student data from Firebase
      fetchStudentData(actualStudentData);
    }
  }, [userData, currentUser]);

  const fetchStudentData = async (student) => {
    try {
      // Fetch student-specific data from Firebase
      const [
        notificationsSnapshot, 
        coursesSnapshot, 
        assignmentsSnapshot, 
        feeSnapshot, 
        resultsSnapshot, 
        attendanceSnapshot
      ] = await Promise.allSettled([
        getDocs(query(collection(db, "notifications"), where("studentId", "==", student.id))),
        getDocs(query(collection(db, "studentCourses"), where("studentId", "==", student.id))),
        getDocs(query(collection(db, "assignments"), where("studentId", "==", student.id), where("status", "in", ["pending", "due"]))),
        getDocs(query(collection(db, "feePayments"), where("studentId", "==", student.id), orderBy("dueDate", "desc"), limit(1))),
        getDocs(query(collection(db, "results"), where("studentId", "==", student.id), orderBy("semester", "desc"), limit(1))),
        getDocs(query(collection(db, "attendance"), where("studentId", "==", student.id), orderBy("date", "desc"), limit(1))),
      ]);

      // Process notifications
      if (notificationsSnapshot.status === 'fulfilled' && !notificationsSnapshot.value.empty) {
        const notificationsData = notificationsSnapshot.value.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(notificationsData);
      } else {
        setNotifications(getMockNotifications());
      }

      // Process courses
      if (coursesSnapshot.status === 'fulfilled' && !coursesSnapshot.value.empty) {
        const coursesData = coursesSnapshot.value.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
      } else {
        setCourses(getMockCourses());
      }

      // Process assignments
      if (assignmentsSnapshot.status === 'fulfilled' && !assignmentsSnapshot.value.empty) {
        const assignmentsData = assignmentsSnapshot.value.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingAssignments(assignmentsData);
      } else {
        setUpcomingAssignments(getMockAssignments());
      }

      // Process fee status
      if (feeSnapshot.status === 'fulfilled' && !feeSnapshot.value.empty) {
        setFeeStatus(feeSnapshot.value.docs[0].data());
      } else {
        setFeeStatus(getMockFeeStatus());
      }

      // Process results
      if (resultsSnapshot.status === 'fulfilled' && !resultsSnapshot.value.empty) {
        setResults(resultsSnapshot.value.docs[0].data());
      } else {
        setResults(getMockResults());
      }

      // Process attendance
      if (attendanceSnapshot.status === 'fulfilled' && !attendanceSnapshot.value.empty) {
        setAttendance(attendanceSnapshot.value.docs[0].data());
      } else {
        setAttendance(getMockAttendance());
      }

      // Fetch timetable for the student's class
      fetchTimetableForClass(student.class);

    } catch (error) {
      console.error("Error fetching student data:", error);
      // Fallback to mock data if Firebase data is not available
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions
  const getMockNotifications = () => [
    {
      id: "notif-1",
      message: "Your assignment has been graded",
      read: false,
      timestamp: { seconds: Date.now() / 1000 - 86400 },
    },
    {
      id: "notif-2",
      message: "New notice from school administration",
      read: false,
      timestamp: { seconds: Date.now() / 1000 - 172800 },
    },
  ];

  const getMockCourses = () => [
    {
      id: "course-1",
      name: "Mathematics",
      code: "MATH101",
      teacher: "Dr. Smith",
      progress: 75,
      credits: 4,
      room: "Room 301",
    },
    {
      id: "course-2",
      name: "Science",
      code: "SCI201",
      teacher: "Prof. Johnson",
      progress: 60,
      credits: 3,
      room: "Lab B",
    },
  ];

  const getMockAssignments = () => [
    {
      id: "assign-1",
      title: "Algebra Homework",
      course: "Mathematics",
      status: "pending",
      dueDate: { seconds: Date.now() / 1000 + 86400 * 2 },
    },
    {
      id: "assign-2",
      title: "Science Project",
      course: "Science",
      status: "completed",
      dueDate: { seconds: Date.now() / 1000 - 86400 },
    },
  ];

  const getMockFeeStatus = () => ({
    status: "paid",
    amount: 500,
    dueDate: { seconds: Date.now() / 1000 + 86400 * 30 },
  });

  const getMockResults = () => ({
    averageGrade: "85.5",
    semester: "1",
  });

  const getMockAttendance = () => ({
    percentage: 92,
    present: 46,
    total: 50,
    absent: 4,
  });

  const setMockData = () => {
    setNotifications(getMockNotifications());
    setCourses(getMockCourses());
    setUpcomingAssignments(getMockAssignments());
    setFeeStatus(getMockFeeStatus());
    setResults(getMockResults());
    setAttendance(getMockAttendance());
  };

  const fetchTimetableForClass = async (className) => {
    try {
      const q = query(
        collection(db, "timetables"),
        where("__name__", "==", className)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const timetableData = querySnapshot.docs[0].data();
        const timeSlots = timetableData.timeSlots || [];
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const formattedTimetable = [];

        days.forEach((day) => {
          timeSlots.forEach((slot) => {
            if (
              timetableData[day] &&
              timetableData[day][slot.text] &&
              !slot.isBreak
            ) {
              formattedTimetable.push({
                day,
                time: slot.text,
                subject: timetableData[day][slot.text].subject,
                room: timetableData[day][slot.text].room || "TBA",
                teacher: timetableData[day][slot.text].teacher || "Teacher",
              });
            }
          });
        });

        setTimetable(formattedTimetable);
      } else {
        console.log("No timetable found for class:", className);
        setTimetable([]);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setTimetable([]);
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Student Not Found
          </h2>
          <p className="text-gray-600">No student data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {studentData.name}!
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Roll No: {studentData.rollNumber || "N/A"}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Class: {studentData.class || "N/A"}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Section: {studentData.section || "N/A"}
          </span>
          {attendance.percentage && (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Attendance: {attendance.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Student Info Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <IdentificationIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Student ID</p>
              <p className="text-xl md:text-2xl font-bold">
                {studentData.rollNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Status Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Fee Status</p>
              <p className="text-xl md:text-2xl font-bold">
                {feeStatus.status === "paid" || feeStatus.paid
                  ? "Paid"
                  : "Pending"}
              </p>
              {feeStatus.dueDate && (
                <p className="text-xs opacity-90">
                  Due:{" "}
                  {new Date(
                    feeStatus.dueDate.seconds * 1000
                  ).toLocaleDateString()}
                </p>
              )}
              {feeStatus.amount && (
                <p className="text-xs opacity-90">
                  Amount: ${feeStatus.amount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Attendance</p>
              <p className="text-xl md:text-2xl font-bold">
                {attendance.percentage || "0"}%
              </p>
              {attendance.present && attendance.total && (
                <p className="text-xs opacity-90">
                  {attendance.present}/{attendance.total} days
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <TableCellsIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Average Grade</p>
              <p className="text-xl md:text-2xl font-bold">
                {results.averageGrade || "N/A"}%
              </p>
              <p className="text-xs opacity-90">
                {results.semester
                  ? `Semester ${results.semester}`
                  : "View report card"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses and Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
              <span className="text-sm text-gray-500">
                {courses.length} courses
              </span>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {course.name}
                          </h3>
                          <p className="text-sm text-gray-600">{course.code}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {course.teacher || "Instructor"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Credits: {course.credits || 3}</span>
                        <span>Room: {course.room || "TBA"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No courses found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Assignments
              </h2>
              <span className="text-sm text-gray-500">
                {upcomingAssignments.length} assignments
              </span>
            </div>
            <div className="p-4 md:p-6">
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 md:p-4 border rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            assignment.status === "completed"
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          {assignment.status === "completed" ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {assignment.course}
                          </p>
                          {assignment.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due:{" "}
                              {new Date(
                                assignment.dueDate.seconds * 1000
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-medium ${
                            assignment.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {assignment.status === "completed"
                            ? "Completed"
                            : assignment.dueDate
                            ? `Due: ${new Date(
                                assignment.dueDate.seconds * 1000
                              ).toLocaleDateString()}`
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No assignments found</p>
                </div>
              )}
            </div>
          </div>

          {/* Timetable Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Weekly Timetable - {studentData.class}
              </h2>
            </div>
            <div className="p-4 md:p-6">
              {timetable.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timetable.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.day}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.time}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.subject}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.room}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TableCellsIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No timetable available for {studentData.class}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications and Profile */}
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  {studentData.photo ? (
                    <img
                      src={studentData.photo}
                      alt={studentData.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{studentData.name}</h2>
                  <p className="text-sm opacity-90">
                    {studentData.rollNumber || "N/A"} •{" "}
                    {studentData.class || "N/A"}
                    {studentData.section ? `-${studentData.section}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <AcademicCapSolid className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-500">Class</p>
                    <p className="font-medium">{studentData.class || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-500">Section</p>
                    <p className="font-medium">
                      {studentData.section || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-500">Academic Year</p>
                    <p className="font-medium">
                      {studentData.academicYear || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <p className="text-gray-500">Courses</p>
                    <p className="font-medium">{courses.length}</p>
                  </div>
                </div>
              </div>

              {/* Additional student details */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {studentData.email || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {studentData.phone || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Address:</span>{" "}
                    {studentData.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Notifications
              </h2>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="p-4 md:p-6">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${
                        notification.read
                          ? "bg-gray-50"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-600"
                              : "text-blue-800 font-medium"
                          }`}
                        >
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp?.seconds
                          ? new Date(
                              notification.timestamp.seconds * 1000
                            ).toLocaleDateString()
                          : "Recent"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BellIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Attendance Summary
              </h2>
            </div>
            <div className="p-4 md:p-6">
              {attendance.percentage !== undefined ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Attendance
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {attendance.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${attendance.percentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-bold">
                        {attendance.present || 0}
                      </p>
                      <p className="text-gray-600">Present</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-red-800 font-bold">
                        {attendance.absent || 0}
                      </p>
                      <p className="text-gray-600">Absent</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ChartBarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;