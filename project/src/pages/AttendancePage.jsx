import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Calendar,
  User,
  Hash,
  Bookmark,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import toast from "react-hot-toast";
import { CSVLink } from "react-csv";

const AttendancePage = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [classSelected, setClassSelected] = useState("");
  const [sectionSelected, setSectionSelected] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const classes = [
    "Pre-K",
    "K",
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
    "11",
    "12",
  ];
  const sections = ["A", "B", "C", "D"];

  const calculatePercentage = (count) => {
    if (attendanceRecords.length === 0) return 0;
    return Math.round((count / attendanceRecords.length) * 100);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classSelected || !sectionSelected) {
        setStudents([]);
        setAttendanceRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const studentsRef = collection(db, "students");
        const q = query(
          studentsRef,
          where("class", "==", classSelected),
          where("section", "==", sectionSelected),
          where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        const studentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentData);
        setTotalRecords(studentData.length);
        
        const initialRecords = studentData.map((student) => ({
          studentId: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          status: "present",
          photo: student.photo,
          admissionNo: student.admissionNo || "",
          class: student.class,
          section: student.section
        }));

        setAttendanceRecords(initialRecords);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classSelected, sectionSelected]);

  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!classSelected || !sectionSelected || !date || students.length === 0)
        return;

      try {
        const attendanceRef = collection(db, "attendance");
        const q = query(
          attendanceRef,
          where("date", "==", date),
          where("class", "==", classSelected),
          where("section", "==", sectionSelected)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          const mergedRecords = students.map((student) => {
            const existingRecord = docData.records.find(
              (r) => r.studentId === student.id
            );
            return (
              existingRecord || {
                studentId: student.id,
                name: student.name,
                rollNumber: student.rollNumber,
                status: "present",
                photo: student.photo,
                admissionNo: student.admissionNo || "",
                class: student.class,
                section: student.section
              }
            );
          });
          setAttendanceRecords(mergedRecords);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast.error("Failed to load existing attendance. Please check your permissions.");
      }
    };

    fetchExistingAttendance();
  }, [date, classSelected, sectionSelected, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleBulkStatusChange = (status) => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) => ({ ...record, status }))
    );
    toast.success(`All students marked as ${status}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("You must be logged in to submit attendance");
      return;
    }

    if (!classSelected || !sectionSelected) {
      toast.error("Please select both class and section");
      return;
    }

    if (attendanceRecords.length === 0) {
      toast.error("No students to submit attendance for");
      return;
    }

    // Validate all records have status
    if (attendanceRecords.some(record => !record.status)) {
      toast.error("All students must have an attendance status");
      return;
    }

    setSubmitting(true);
    try {
      const attendanceData = {
        date,
        class: classSelected,
        section: sectionSelected,
        records: attendanceRecords,
        submittedBy: currentUser.uid,
        submittedName: currentUser.displayName || "Teacher",
        submittedAt: Timestamp.now(),
        totalStudents: attendanceRecords.length,
        presentCount: attendanceRecords.filter(r => r.status === "present").length,
        absentCount: attendanceRecords.filter(r => r.status === "absent").length,
        lastUpdated: Timestamp.now()
      };

      const docId = `${date}-${classSelected}-${sectionSelected}`;
      await setDoc(doc(db, "attendance", docId), attendanceData);

      toast.success("Attendance recorded successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(`Failed to save attendance: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const prepareCSVData = () => {
    return attendanceRecords.map((record) => ({
      "Admission No": record.admissionNo || "",
      "Roll No": record.rollNumber,
      "Student Name": record.name,
      Status: record.status.toUpperCase(),
      Class: record.class,
      Section: record.section,
      Date: date,
    }));
  };

  const filteredRecords = attendanceRecords
    .filter((record) => filter === "all" || record.status === filter)
    .filter(
      (record) =>
        searchTerm === "" ||
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.rollNumber.toString().includes(searchTerm) ||
        (record.admissionNo &&
          record.admissionNo.toString().includes(searchTerm))
    );

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-blue-200 rounded-lg w-1/3"></div>
            <div className="h-10 bg-blue-200 rounded-lg w-full"></div>
            <div className="h-64 bg-blue-200 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-indigo-900 flex items-center">
              <Bookmark className="mr-3 h-7 w-7 text-indigo-600" />
              Student Attendance
            </h1>
            <p className="text-sm text-indigo-600 mt-1">
              Track and manage student attendance records
            </p>
          </div>
          {classSelected && sectionSelected && attendanceRecords.length > 0 && (
            <div className="flex gap-3">
              <CSVLink
                data={prepareCSVData()}
                filename={`attendance-${classSelected}-${sectionSelected}-${date}.csv`}
                className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base shadow-md hover:shadow-indigo-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </CSVLink>
            </div>
          )}
        </div>

        {/* Filters and Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <label className="block text-sm font-medium text-indigo-800 mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm md:text-base bg-white"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <label className="block text-sm font-medium text-indigo-800 mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Class
            </label>
            <select
              value={classSelected}
              onChange={(e) => {
                setClassSelected(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm md:text-base bg-white"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <label className="block text-sm font-medium text-indigo-800 mb-2 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-indigo-600" />
              Section
            </label>
            <select
              value={sectionSelected}
              onChange={(e) => {
                setSectionSelected(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm md:text-base bg-white"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and Action Bar */}
        {classSelected && sectionSelected && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by name, roll no, or admission no..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-11 pr-4 py-2.5 w-full border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base bg-white"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
                <Search className="h-5 w-5" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm border ${
                  showFilters
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm border ${
                  showBulkActions
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <span>Bulk Actions</span>
                {showBulkActions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Additional Filters */}
        {showFilters && (
          <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-3">
              Filter by Status
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm border ${
                  filter === "all"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <span>All</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {attendanceRecords.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setFilter("present");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm border ${
                  filter === "present"
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-white text-green-700 border-green-200 hover:bg-green-50"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>Present</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {
                    attendanceRecords.filter((r) => r.status === "present")
                      .length
                  }
                </span>
              </button>
              <button
                onClick={() => {
                  setFilter("absent");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm border ${
                  filter === "absent"
                    ? "bg-red-600 text-white border-red-700"
                    : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                }`}
              >
                <X className="h-4 w-4" />
                <span>Absent</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {
                    attendanceRecords.filter((r) => r.status === "absent")
                      .length
                  }
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-3">
              Bulk Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkStatusChange("present")}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center space-x-2 hover:bg-green-200 text-sm border border-green-200"
              >
                <Check className="h-4 w-4" />
                <span>Mark All Present</span>
              </button>
              <button
                onClick={() => handleBulkStatusChange("absent")}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center space-x-2 hover:bg-red-200 text-sm border border-red-200"
              >
                <X className="h-4 w-4" />
                <span>Mark All Absent</span>
              </button>
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        {classSelected && sectionSelected && attendanceRecords.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-green-800">Present</h3>
                <span className="text-2xl font-bold text-green-700">
                  {
                    attendanceRecords.filter((r) => r.status === "present")
                      .length
                  }
                </span>
              </div>
              <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${calculatePercentage(
                      attendanceRecords.filter((r) => r.status === "present")
                        .length
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-green-600">
                {calculatePercentage(
                  attendanceRecords.filter((r) => r.status === "present").length
                )}
                % of class
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-red-800">Absent</h3>
                <span className="text-2xl font-bold text-red-700">
                  {
                    attendanceRecords.filter((r) => r.status === "absent")
                      .length
                  }
                </span>
              </div>
              <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${calculatePercentage(
                      attendanceRecords.filter((r) => r.status === "absent")
                        .length
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-red-600">
                {calculatePercentage(
                  attendanceRecords.filter((r) => r.status === "absent").length
                )}
                % of class
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-indigo-800">Total</h3>
                <span className="text-2xl font-bold text-indigo-700">
                  {attendanceRecords.length}
                </span>
              </div>
              <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-indigo-600">
                Class {classSelected}-{sectionSelected}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {classSelected && sectionSelected ? (
          <div className="overflow-x-auto rounded-xl border border-indigo-100 shadow-sm">
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Photo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Admission No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Roll No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Student Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-50">
                {currentRecords.length > 0 ? (
                  currentRecords.map((record) => (
                    <tr
                      key={record.studentId}
                      className="hover:bg-indigo-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={
                              record.photo ||
                              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            }
                            alt={record.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">
                        {record.admissionNo || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">
                        {record.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-900">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleStatusChange(record.studentId, "present")
                            }
                            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 text-xs border ${
                              record.status === "present"
                                ? "bg-green-600 text-white border-green-700"
                                : "bg-white text-green-700 border-green-200 hover:bg-green-50"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(record.studentId, "absent")
                            }
                            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 text-xs border ${
                              record.status === "absent"
                                ? "bg-red-600 text-white border-red-700"
                                : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-indigo-500"
                    >
                      {students.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <User className="h-10 w-10 text-indigo-300 mb-2" />
                          <p>No students found in this class/section</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Search className="h-10 w-10 text-indigo-300 mb-2" />
                          <p>No records match your search/filter</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-indigo-500 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-2 border-indigo-200">
              <User className="h-12 w-12 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-indigo-800">
              No Class Selected
            </h3>
            <p className="max-w-md mx-auto text-indigo-600">
              Please select a class and section to view and manage attendance
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredRecords.length > recordsPerPage && (
          <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, filteredRecords.length)}
              </span>{' '}
              of <span className="font-medium">{filteredRecords.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || filteredRecords.length === 0}
                className={`p-2 rounded-md ${currentPage === totalPages || filteredRecords.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages || filteredRecords.length === 0}
                className={`p-2 rounded-md ${currentPage === totalPages || filteredRecords.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {classSelected && sectionSelected && (
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-indigo-600">
              Showing {filteredRecords.length} of {attendanceRecords.length}{" "}
              students in Class {classSelected}-{sectionSelected}
            </div>
            <button
              onClick={handleSubmit}
              disabled={attendanceRecords.length === 0 || submitting}
              className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center shadow-md hover:shadow-indigo-200 transition-all ${
                attendanceRecords.length === 0 || submitting
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
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
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Attendance
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;