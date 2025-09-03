import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
  Download,
  Upload,
  Clock,
  UserCheck,
  UserX,
  Users,
  ClipboardList,
  Plus,
  Save,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, subDays, addDays, isSameDay } from "date-fns";

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    rollNo: "",
    contact: "",
  });
  const [viewMode, setViewMode] = useState("mark"); // 'mark' or 'view'
  const [viewStartDate, setViewStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  );
  const [viewEndDate, setViewEndDate] = useState(
    new Date().toISOString().substr(0, 10)
  );

  // Class and section options
  const classes = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
  ];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);

        // Try to load from localStorage first
        const savedStudents = localStorage.getItem(
          `students-${selectedClass}-${selectedSection}`
        );
        const savedAttendance = localStorage.getItem(
          `attendance-${selectedClass}-${selectedSection}`
        );

        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
          setFilteredStudents(JSON.parse(savedStudents));
        } else {
          // Mock data for demonstration if no saved data
          const mockStudents =
            selectedClass && selectedSection
              ? Array.from({ length: 15 }, (_, i) => ({
                  id: `${selectedClass}-${selectedSection}-${i + 1}`,
                  name: `Student ${i + 1}`,
                  rollNo: `${selectedClass}${selectedSection}${String(
                    i + 1
                  ).padStart(2, "0")}`,
                  class: selectedClass,
                  section: selectedSection,
                  contact: `+1 (555) ${Math.floor(
                    100 + Math.random() * 900
                  )}-${Math.floor(1000 + Math.random() * 9000)}`,
                  lastAttendance: format(
                    new Date(
                      Date.now() -
                        Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
                    ),
                    "yyyy-MM-dd"
                  ),
                  attendanceRate: Math.floor(70 + Math.random() * 30),
                }))
              : [];

          setStudents(mockStudents);
          setFilteredStudents(mockStudents);
        }

        if (savedAttendance) {
          setAttendanceRecords(JSON.parse(savedAttendance));
        } else {
          setAttendanceRecords([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleNameChange = (studentId, newName) => {
    const updatedStudents = students.map((student) =>
      student.id === studentId ? { ...student, name: newName } : student
    );
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
  };

  const saveStudents = () => {
    localStorage.setItem(
      `students-${selectedClass}-${selectedSection}`,
      JSON.stringify(students)
    );
    alert("Student names saved successfully!");
  };

  const handleAttendanceChange = (studentId, status) => {
    const existingRecordIndex = attendanceRecords.findIndex(
      (record) => record.studentId === studentId && record.date === selectedDate
    );

    let updatedRecords;
    if (existingRecordIndex >= 0) {
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex].status = status;
      updatedRecords[existingRecordIndex].timestamp = new Date().toISOString();
    } else {
      updatedRecords = [
        ...attendanceRecords,
        {
          studentId,
          date: selectedDate,
          status,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    setAttendanceRecords(updatedRecords);
    localStorage.setItem(
      `attendance-${selectedClass}-${selectedSection}`,
      JSON.stringify(updatedRecords)
    );
  };

  const getAttendanceStatus = (studentId, date = selectedDate) => {
    const record = attendanceRecords.find(
      (record) => record.studentId === studentId && record.date === date
    );
    return record ? record.status : "";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(
        `Attendance submitted for Class ${selectedClass} Section ${selectedSection} on ${format(
          parseISO(selectedDate),
          "MMMM d, yyyy"
        )}`
      );
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Failed to submit attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewStudent = () => {
    if (!newStudentName.trim()) return;

    // Find the highest numeric part in existing roll numbers
    const rollNoPattern = new RegExp(
      `${selectedClass}${selectedSection}(\\d+)`
    );
    let maxRollNo = 0;

    students.forEach((student) => {
      const match = student.rollNo.match(rollNoPattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxRollNo) {
          maxRollNo = num;
        }
      }
    });

    const newRollNoNum = maxRollNo + 1;
    const newRollNo = `${selectedClass}${selectedSection}${String(
      newRollNoNum
    ).padStart(2, "0")}`;
    const newId = `${selectedClass}-${selectedSection}-${newRollNoNum}`;

    const newStudent = {
      id: newId,
      name: newStudentName.trim(),
      rollNo: newRollNo,
      class: selectedClass,
      section: selectedSection,
      contact: "",
      lastAttendance: "",
      attendanceRate: 0,
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setNewStudentName("");
    setIsAddingStudent(false);

    // Save to localStorage
    localStorage.setItem(
      `students-${selectedClass}-${selectedSection}`,
      JSON.stringify(updatedStudents)
    );
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student.id);
    setEditFormData({
      name: student.name,
      rollNo: student.rollNo,
      contact: student.contact,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const saveEditedStudent = () => {
    const updatedStudents = students.map((student) =>
      student.id === editingStudent
        ? {
            ...student,
            name: editFormData.name,
            rollNo: editFormData.rollNo,
            contact: editFormData.contact,
          }
        : student
    );

    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setEditingStudent(null);
    localStorage.setItem(
      `students-${selectedClass}-${selectedSection}`,
      JSON.stringify(updatedStudents)
    );
  };

  const cancelEdit = () => {
    setEditingStudent(null);
  };

  // Calculate attendance stats
  const presentCount = attendanceRecords.filter(
    (record) => record.date === selectedDate && record.status === "present"
  ).length;
  const absentCount = attendanceRecords.filter(
    (record) => record.date === selectedDate && record.status === "absent"
  ).length;
  const totalStudents = filteredStudents.length;
  const attendancePercentage =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Generate date range for view mode
  const generateDateRange = () => {
    const dates = [];
    let currentDate = new Date(viewStartDate);
    const endDate = new Date(viewEndDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  };

  const dateRange = generateDateRange();

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "mark" ? "view" : "mark");
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <span className="text-gray-300">—</span>;
    }
  };

  if (isLoading && selectedClass && selectedSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-xl p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-indigo-600" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Class Attendance
              </span>
            </h1>
            <p className="text-gray-600 mt-2">
              {viewMode === "mark"
                ? "Mark and manage student attendance with ease"
                : "View attendance records"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {viewMode === "mark" ? (
              <div className="relative bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={viewStartDate}
                    onChange={(e) => setViewStartDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <span>to</span>
                <div className="relative bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={viewEndDate}
                    onChange={(e) => setViewEndDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
            <button
              onClick={toggleViewMode}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === "mark"
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              <Eye className="h-4 w-4" />
              {viewMode === "mark" ? "View Records" : "Mark Attendance"}
            </button>
          </div>
        </div>

        {/* Class/Section Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls === "Pre-K" || cls === "K" ? cls : `Class ${cls}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Section
            </label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="appearance-none w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClass("");
                setSelectedSection("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full transition-colors duration-200"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {selectedClass && selectedSection ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Present Today
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {presentCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Absent Today
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {absentCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <UserX className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Attendance %
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {attendancePercentage}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between gap-4 border border-gray-100">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={`Search students in Class ${selectedClass} Section ${selectedSection}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                {viewMode === "mark" && (
                  <>
                    <button
                      onClick={saveStudents}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-2 transition-colors duration-200 border border-indigo-100"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Names</span>
                    </button>
                    <button
                      onClick={() => setIsAddingStudent(true)}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 transition-colors duration-200 border border-green-100"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Student</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Add Student Form */}
            {isAddingStudent && viewMode === "mark" && (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center gap-4 border border-gray-100">
                <input
                  type="text"
                  placeholder="Enter new student name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={addNewStudent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 w-full md:w-auto"
                  >
                    Add Student
                  </button>
                  <button
                    onClick={() => setIsAddingStudent(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full md:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Sheet */}
            {viewMode === "mark" ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => {
                          const status = getAttendanceStatus(student.id);
                          const isExpanded = expandedStudent === student.id;
                          const isEditing = editingStudent === student.id;

                          return (
                            <>
                              <tr
                                key={student.id}
                                className={`hover:bg-gray-50 ${
                                  isExpanded ? "bg-gray-50" : ""
                                }`}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    {isEditing ? (
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                        <input
                                          type="text"
                                          name="rollNo"
                                          value={editFormData.rollNo}
                                          onChange={handleEditFormChange}
                                          className="w-full text-center bg-transparent border-b border-gray-200 focus:outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                        {student.rollNo}
                                      </div>
                                    )}
                                    <div className="ml-4">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          name="name"
                                          value={editFormData.name}
                                          onChange={handleEditFormChange}
                                          className="text-sm font-medium text-gray-900 border-b border-gray-200 focus:outline-none focus:border-indigo-500 bg-transparent"
                                        />
                                      ) : (
                                        <div className="text-sm font-medium text-gray-900">
                                          {student.name}
                                        </div>
                                      )}
                                      <div className="text-sm text-gray-500">
                                        Class {student.class} - Sec{" "}
                                        {student.section}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    {status === "present" ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Present
                                      </span>
                                    ) : status === "absent" ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        Absent
                                      </span>
                                    ) : (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Not Marked
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={saveEditedStudent}
                                          className="px-3 py-1 rounded-lg flex items-center gap-1 text-sm bg-green-100 text-green-800"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="px-3 py-1 rounded-lg flex items-center gap-1 text-sm bg-gray-100 text-gray-700"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleAttendanceChange(
                                              student.id,
                                              "present"
                                            )
                                          }
                                          className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm ${
                                            status === "present"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                          }`}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                          Present
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleAttendanceChange(
                                              student.id,
                                              "absent"
                                            )
                                          }
                                          className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm ${
                                            status === "absent"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                          }`}
                                        >
                                          <XCircle className="h-4 w-4" />
                                          Absent
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleEditStudent(student)
                                          }
                                          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setExpandedStudent(
                                              isExpanded ? null : student.id
                                            )
                                          }
                                          className="p-1 rounded-full hover:bg-gray-100"
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                          )}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-gray-50">
                                  <td colSpan="3" className="px-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <p className="font-medium text-gray-500">
                                          Contact
                                        </p>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            name="contact"
                                            value={editFormData.contact}
                                            onChange={handleEditFormChange}
                                            className="border-b border-gray-200 focus:outline-none focus:border-indigo-500 bg-transparent w-full"
                                          />
                                        ) : (
                                          <p>
                                            {student.contact || "Not provided"}
                                          </p>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-500">
                                          Last Attendance
                                        </p>
                                        <p>
                                          {student.lastAttendance ||
                                            "No record"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-500">
                                          Attendance Rate
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span>{student.attendanceRate}%</span>
                                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                              className="bg-indigo-600 h-1.5 rounded-full"
                                              style={{
                                                width: `${student.attendanceRate}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Users className="h-12 w-12 text-gray-300 mb-2" />
                              <p>
                                No students found in Class {selectedClass}{" "}
                                Section {selectedSection}
                              </p>
                              <button
                                onClick={() => setIsAddingStudent(true)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add New Student
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // View Attendance Records
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        {dateRange.map((date) => (
                          <th
                            key={date}
                            className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-xs">
                                {format(date, "EEE")}
                              </span>
                              <span className="text-xs font-bold">
                                {format(date, "d")}
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Summary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => {
                          // Calculate attendance stats for this student
                          const studentRecords = attendanceRecords.filter(
                            (r) => r.studentId === student.id
                          );
                          const presentDays = studentRecords.filter(
                            (r) => r.status === "present"
                          ).length;
                          const totalDays = dateRange.length;
                          const attendanceRate =
                            totalDays > 0
                              ? Math.round((presentDays / totalDays) * 100)
                              : 0;

                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                    {student.rollNo}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Class {student.class} - Sec{" "}
                                      {student.section}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {dateRange.map((date) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                const status = getAttendanceStatus(
                                  student.id,
                                  dateStr
                                );
                                return (
                                  <td
                                    key={dateStr}
                                    className="px-3 py-4 whitespace-nowrap text-center"
                                  >
                                    {getStatusIcon(status)}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-sm font-medium">
                                    {attendanceRate}%
                                  </span>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-indigo-600 h-1.5 rounded-full"
                                      style={{
                                        width: `${attendanceRate}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={dateRange.length + 2}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Users className="h-12 w-12 text-gray-300 mb-2" />
                              <p>
                                No students found in Class {selectedClass}{" "}
                                Section {selectedSection}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {viewMode === "mark" && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {filteredStudents.length} of {students.length}{" "}
                  students
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || filteredStudents.length === 0}
                    className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 flex items-center gap-2 ${
                      isSubmitting || filteredStudents.length === 0
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Submit Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
              <ClipboardList className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Select Class and Section
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Please choose a class and section from the dropdown menus above to
              view and mark attendance
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls === "Pre-K" || cls === "K" ? cls : `Class ${cls}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="appearance-none w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
