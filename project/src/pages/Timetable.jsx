import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const classOptions = [
  "Pre-K",
  "Kindergarten",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Timetable = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // State management
  const [classTimetables, setClassTimetables] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(4);
  const [viewMode, setViewMode] = useState("edit");
  const [selectedClass, setSelectedClass] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [timetable, setTimetable] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [editingSubject, setEditingSubject] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    start: "",
    end: "",
    period: "",
    isBreak: false,
  });
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [editingTimeSlotIndex, setEditingTimeSlotIndex] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const teachersSnapshot = await getDocs(collection(db, "teachers"));
          setTeachers(
            teachersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }

        const timetablesSnapshot = await getDocs(collection(db, "timetables"));
        const timetablesData = {};
        timetablesSnapshot.forEach((doc) => {
          timetablesData[doc.id] = doc.data();
        });
        setClassTimetables(timetablesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [isAdmin]);

  // Load timetable when class changes
  useEffect(() => {
    if (isAdmin && selectedClass && classTimetables[selectedClass]) {
      setTimetable(classTimetables[selectedClass]);
      setTimeSlots(classTimetables[selectedClass].timeSlots || []);
    } else {
      setTimetable({});
      setTimeSlots([]);
    }
    setSelectedCell(null);
    setEditingSubject("");
    setTeacherName("");
  }, [selectedClass, classTimetables, isAdmin]);

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const saveTimetable = async (updatedData) => {
    try {
      await setDoc(doc(db, "timetables", selectedClass), updatedData);
      setClassTimetables((prev) => ({
        ...prev,
        [selectedClass]: updatedData,
      }));
      return true;
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast.error("Failed to save timetable");
      return false;
    }
  };

  const handleCellClick = (day, period, cellData) => {
    if (!isAdmin || !selectedClass) {
      if (!selectedClass) {
        toast.warning("Please select a class first");
      }
      return;
    }
    if (cellData?.isBreak) return;

    setSelectedCell({ day, period });
    setEditingSubject(cellData?.subject || "");
    setTeacherName(cellData?.teacher || "");
  };

  const handleSave = async () => {
    if (!isAdmin || !selectedClass || !editingSubject || !selectedCell) return;

    const { day, period } = selectedCell;
    const value = {
      class: selectedClass,
      subject: editingSubject,
      teacher: teacherName,
      displayText: `${selectedClass} - ${editingSubject}${
        teacherName ? ` (${teacherName})` : ""
      }`,
    };

    const updatedTimetable = {
      ...timetable,
      [day]: {
        ...timetable[day],
        [period]: value,
      },
      timeSlots,
    };

    if (await saveTimetable(updatedTimetable)) {
      setTimetable(updatedTimetable);
      toast.success("Timetable saved successfully");
      setSelectedCell(null);
      setEditingSubject("");
      setTeacherName("");
    }
  };

  const handleClearCell = async (day, period) => {
    if (!isAdmin) return;

    const cellData = timetable[day]?.[period];
    if (cellData?.isBreak) {
      toast.warning("Cannot clear break periods");
      return;
    }

    const updatedTimetable = { ...timetable };
    if (updatedTimetable[day]) {
      delete updatedTimetable[day][period];
      if (Object.keys(updatedTimetable[day]).length === 0) {
        delete updatedTimetable[day];
      }
    }

    updatedTimetable.timeSlots = timeSlots;

    if (await saveTimetable(updatedTimetable)) {
      setTimetable(updatedTimetable);
      toast.success("Period cleared successfully");
    }
  };

  const handleSaveTimeSlot = async () => {
    if (!isAdmin || !newTimeSlot.start || !newTimeSlot.end) {
      if (!newTimeSlot.start || !newTimeSlot.end) {
        toast.warning("Please enter both start and end times");
      }
      return;
    }

    const formattedSlot = newTimeSlot.isBreak
      ? `BREAK (${formatTime(newTimeSlot.start)} - ${formatTime(
          newTimeSlot.end
        )})`
      : newTimeSlot.period
      ? `${newTimeSlot.period} (${formatTime(newTimeSlot.start)} - ${formatTime(
          newTimeSlot.end
        )})`
      : `${formatTime(newTimeSlot.start)} - ${formatTime(newTimeSlot.end)}`;

    let updatedTimeSlots;
    if (editingTimeSlotIndex !== null) {
      updatedTimeSlots = [...timeSlots];
      updatedTimeSlots[editingTimeSlotIndex] = {
        text: formattedSlot,
        isBreak: newTimeSlot.isBreak,
      };
    } else {
      updatedTimeSlots = [
        ...timeSlots,
        {
          text: formattedSlot,
          isBreak: newTimeSlot.isBreak,
        },
      ];
    }

    const updatedTimetable = { ...timetable, timeSlots: updatedTimeSlots };

    if (await saveTimetable(updatedTimetable)) {
      setTimeSlots(updatedTimeSlots);
      setTimetable(updatedTimetable);
      setNewTimeSlot({ start: "", end: "", period: "", isBreak: false });
      setShowTimeSlotForm(false);
      setEditingTimeSlotIndex(null);
      toast.success(
        `Time slot ${
          editingTimeSlotIndex !== null ? "updated" : "added"
        } successfully`
      );
    }
  };

  const handleEditTimeSlot = (index) => {
    if (!isAdmin) return;

    const slot = timeSlots[index];
    const timeMatch = slot.text.match(/(\d+:\d+ [AP]M) - (\d+:\d+ [AP]M)/);
    const periodMatch = slot.text.match(/^(.+?) \(\d+:\d+ [AP]M/);

    if (timeMatch) {
      const [_, startTime, endTime] = timeMatch;
      const convertTo24Hour = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":");
        hours = parseInt(hours);
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      };

      setNewTimeSlot({
        start: convertTo24Hour(startTime),
        end: convertTo24Hour(endTime),
        period: periodMatch && !slot.isBreak ? periodMatch[1] : "",
        isBreak: slot.isBreak || false,
      });
      setEditingTimeSlotIndex(index);
      setShowTimeSlotForm(true);
    }
  };

  const handleRemoveTimeSlot = async (index) => {
    if (!isAdmin) return;

    const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
    const updatedTimetable = { ...timetable, timeSlots: updatedTimeSlots };

    if (await saveTimetable(updatedTimetable)) {
      setTimeSlots(updatedTimeSlots);
      setTimetable(updatedTimetable);
      toast.success("Time slot removed successfully");
    }
  };

  const handleClearAll = async () => {
    if (!isAdmin || !selectedClass) {
      if (!selectedClass) {
        toast.warning("Please select a class first");
      }
      return;
    }

    if (
      window.confirm("Are you sure you want to clear the entire timetable?")
    ) {
      try {
        await deleteDoc(doc(db, "timetables", selectedClass));

        setTimetable({});
        setTimeSlots([]);
        setClassTimetables((prev) => {
          const newTimetables = { ...prev };
          delete newTimetables[selectedClass];
          return newTimetables;
        });

        toast.success("Timetable cleared successfully");
      } catch (error) {
        console.error("Error clearing timetable:", error);
        toast.error("Failed to clear timetable");
      }
    }
  };

  // Pagination logic
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = classOptions.slice(
    indexOfFirstClass,
    indexOfLastClass
  );
  const totalPages = Math.ceil(classOptions.length / classesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render a single timetable
  const renderTimetable = (className) => {
    const classTimetable = classTimetables[className] || {};
    const timeSlots = classTimetable.timeSlots || [];

    return (
      <div key={className} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Timetable for {className}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                        slot.isBreak ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {slot.text}
                    </td>
                    {days.map((day) => {
                      const cellData = classTimetable[day]?.[slot.text];
                      const isBreak = slot.isBreak;

                      return (
                        <td
                          key={`${day}-${slot.text}`}
                          className={`px-4 py-2 text-center ${
                            isBreak
                              ? "bg-red-50"
                              : cellData
                              ? "bg-indigo-50"
                              : ""
                          }`}
                        >
                          {isBreak ? (
                            <span className="text-red-500 font-medium">
                              BREAK
                            </span>
                          ) : cellData ? (
                            <div className="py-1 px-2 rounded-lg bg-white shadow-xs border border-indigo-100">
                              <div className="font-medium text-indigo-800">
                                {cellData.subject}
                              </div>
                              {cellData.teacher && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {cellData.teacher}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No timetable data available for {className}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // For non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-6">
            <h1 className="text-3xl font-bold">School Timetables</h1>
            <p className="text-indigo-100 opacity-90">
              View all class schedules
            </p>
          </div>

          {/* View All Timetables Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              All Class Timetables
            </h2>

            {currentClasses.map((className) => renderTimetable(className))}

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() =>
                    paginate(currentPage > 1 ? currentPage - 1 : 1)
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border border-gray-300 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 border-t border-b border-gray-300 ${
                        currentPage === number
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    paginate(
                      currentPage < totalPages ? currentPage + 1 : totalPages
                    )
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md border border-gray-300 ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For admin users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-6">
          <h1 className="text-3xl font-bold">School Timetable Manager</h1>
          <p className="text-indigo-100 opacity-90">
            Create and manage class schedules with ease
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === "edit"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Edit Mode
            </button>
            <button
              onClick={() => setViewMode("viewAll")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === "viewAll"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              View All Timetables
            </button>
          </div>
        </div>

        {viewMode === "edit" ? (
          <>
            {/* Controls Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Schedule Configuration
                </h2>
                {selectedClass && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setShowTimeSlotForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Time Slot
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          clipRule="evenodd"
                        />
                      </svg>
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Class and Teacher Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class *
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsClassOpen(!isClassOpen)}
                      className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition-all"
                    >
                      {selectedClass || "Select a class"}
                      <svg
                        className="h-5 w-5 text-gray-400 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{
                          transform: isClassOpen ? "rotate(180deg)" : "",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isClassOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                        {classOptions.map((option) => (
                          <div
                            key={option}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedClass(option);
                              setIsClassOpen(false);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher (Optional)
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (!selectedClass) {
                          toast.warning("Please select a class first");
                          return;
                        }
                        setIsTeacherOpen(!isTeacherOpen);
                      }}
                      className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition-all disabled:opacity-50"
                      disabled={!selectedClass}
                    >
                      {teacherName || "Select a teacher"}
                      <svg
                        className="h-5 w-5 text-gray-400 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{
                          transform: isTeacherOpen ? "rotate(180deg)" : "",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isTeacherOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                        {teachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setTeacherName(teacher.name);
                              setIsTeacherOpen(false);
                            }}
                          >
                            {teacher.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slot Management */}
              {showTimeSlotForm && (
                <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {editingTimeSlotIndex !== null
                      ? "Edit Time Slot"
                      : "Add New Time Slot"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newTimeSlot.start}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            start: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newTimeSlot.end}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            end: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Period Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={newTimeSlot.period}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            period: e.target.value,
                          })
                        }
                        placeholder="e.g., Morning Session"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={newTimeSlot.isBreak}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isBreak"
                        checked={newTimeSlot.isBreak}
                        onChange={(e) =>
                          setNewTimeSlot({
                            ...newTimeSlot,
                            isBreak: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isBreak"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Is Break Period
                      </label>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleSaveTimeSlot}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 shadow-md flex-1 flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {editingTimeSlotIndex !== null ? "Update" : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setShowTimeSlotForm(false);
                        setNewTimeSlot({
                          start: "",
                          end: "",
                          period: "",
                          isBreak: false,
                        });
                        setEditingTimeSlotIndex(null);
                      }}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:from-gray-600 hover:to-gray-700 shadow-md flex-1 flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Time Slots Display */}
              {timeSlots.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Time Slots
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`relative rounded-lg px-3 py-1 text-sm flex items-center group ${
                          slot.isBreak ? "bg-red-100" : "bg-indigo-100"
                        }`}
                      >
                        <span
                          className={
                            slot.isBreak ? "text-red-800" : "text-indigo-800"
                          }
                        >
                          {slot.text}
                        </span>
                        <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTimeSlot(index)}
                            className={
                              slot.isBreak
                                ? "text-red-500 hover:text-red-700"
                                : "text-indigo-500 hover:text-indigo-700"
                            }
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveTimeSlot(index)}
                            className={
                              slot.isBreak
                                ? "text-red-500 hover:text-red-700"
                                : "text-indigo-500 hover:text-indigo-700"
                            }
                            title="Remove"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Input */}
              {selectedCell && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={editingSubject}
                      onChange={(e) => setEditingSubject(e.target.value)}
                      placeholder="Enter subject name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={!selectedClass || !editingSubject}
                      className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md ${
                        !selectedClass || !editingSubject
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Timetable Table Display */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              {!selectedClass ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4 flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <span className="text-lg">
                      Please select a class to view or edit its timetable
                    </span>
                  </div>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4 flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-lg">
                      Create time slots to begin building the timetable for{" "}
                      <span className="font-semibold text-indigo-600">
                        {selectedClass}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setShowTimeSlotForm(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md flex items-center gap-2 mx-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Your First Time Slot
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Timetable for{" "}
                      <span className="text-indigo-600">{selectedClass}</span>
                    </h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Slot
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeSlots.map((slot, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              slot.isBreak ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {slot.text}
                          </td>
                          {days.map((day) => {
                            const isSelected =
                              selectedCell?.day === day &&
                              selectedCell?.period === slot.text;
                            const cellData = timetable[day]?.[slot.text];
                            const isBreak = slot.isBreak;

                            return (
                              <td
                                key={`${day}-${slot.text}`}
                                className={`px-4 py-3 text-center cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-indigo-100 ring-2 ring-indigo-400"
                                    : isBreak
                                    ? "bg-red-50"
                                    : cellData
                                    ? "bg-indigo-50"
                                    : ""
                                }`}
                                onClick={() =>
                                  !isBreak &&
                                  handleCellClick(day, slot.text, cellData)
                                }
                              >
                                {isBreak ? (
                                  <span className="text-red-500 font-medium">
                                    BREAK
                                  </span>
                                ) : cellData ? (
                                  <div className="group relative py-2 px-3 rounded-lg bg-white shadow-xs border border-indigo-100">
                                    <div className="font-medium text-indigo-800 truncate">
                                      {cellData.subject}
                                    </div>
                                    {cellData.teacher && (
                                      <div className="text-xs text-gray-500 mt-1 truncate">
                                        {cellData.teacher}
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearCell(day, slot.text);
                                      }}
                                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:bg-red-600 transition-all"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    className={`text-sm ${
                                      isSelected
                                        ? "text-indigo-600 font-medium"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {isSelected ? "▼ Add subject below" : "+"}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* View All Timetables Section - For admin */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                All Class Timetables
              </h2>

              {currentClasses.map((className) => renderTimetable(className))}

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() =>
                      paginate(currentPage > 1 ? currentPage - 1 : 1)
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border border-gray-300 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 border-t border-b border-gray-300 ${
                          currentPage === number
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      paginate(
                        currentPage < totalPages ? currentPage + 1 : totalPages
                      )
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r-md border border-gray-300 ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Timetable;
