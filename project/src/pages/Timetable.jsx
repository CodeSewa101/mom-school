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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable = () => {
  // State management
  const [selectedClass, setSelectedClass] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [timetable, setTimetable] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [classTimetables, setClassTimetables] = useState({});
  const [editingSubject, setEditingSubject] = useState("");

  // Time slot management
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    start: "",
    end: "",
    period: "",
  });
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [editingTimeSlotIndex, setEditingTimeSlotIndex] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        setTeachers(
          teachersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        // Fetch timetables
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
  }, []);

  // Load timetable when class changes
  useEffect(() => {
    if (selectedClass && classTimetables[selectedClass]) {
      setTimetable(classTimetables[selectedClass]);
      setTimeSlots(classTimetables[selectedClass].timeSlots || []);
    } else {
      setTimetable({});
      setTimeSlots([]);
    }
    setSelectedCell(null);
    setEditingSubject("");
    setTeacherName("");
  }, [selectedClass, classTimetables]);

  // Helper function to format time
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Save timetable to Firestore
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

  // Cell click handler
  const handleCellClick = (day, period, cellData) => {
    if (!selectedClass) {
      toast.warning("Please select a class first");
      return;
    }
    setSelectedCell({ day, period });
    setEditingSubject(cellData?.subject || "");
    setTeacherName(cellData?.teacher || "");
  };

  // Save subject to timetable
  const handleSave = async () => {
    if (!selectedClass || !editingSubject || !selectedCell) return;

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

  // Clear a specific cell
  const handleClearCell = async (day, period) => {
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

  // Add or update time slot
  const handleSaveTimeSlot = async () => {
    if (!newTimeSlot.start || !newTimeSlot.end) {
      toast.warning("Please enter both start and end times");
      return;
    }

    const formattedSlot = newTimeSlot.period
      ? `${newTimeSlot.period} (${formatTime(newTimeSlot.start)} - ${formatTime(
          newTimeSlot.end
        )})`
      : `${formatTime(newTimeSlot.start)} - ${formatTime(newTimeSlot.end)}`;

    let updatedTimeSlots;
    if (editingTimeSlotIndex !== null) {
      // Update existing time slot
      updatedTimeSlots = [...timeSlots];
      updatedTimeSlots[editingTimeSlotIndex] = formattedSlot;
    } else {
      // Add new time slot
      updatedTimeSlots = [...timeSlots, formattedSlot];
    }

    const updatedTimetable = { ...timetable, timeSlots: updatedTimeSlots };

    if (await saveTimetable(updatedTimetable)) {
      setTimeSlots(updatedTimeSlots);
      setTimetable(updatedTimetable);
      setNewTimeSlot({ start: "", end: "", period: "" });
      setShowTimeSlotForm(false);
      setEditingTimeSlotIndex(null);
      toast.success(
        `Time slot ${
          editingTimeSlotIndex !== null ? "updated" : "added"
        } successfully`
      );
    }
  };

  // Edit time slot
  const handleEditTimeSlot = (index) => {
    const slot = timeSlots[index];
    // Extract time from the formatted string
    const timeMatch = slot.match(/(\d+:\d+ [AP]M) - (\d+:\d+ [AP]M)/);
    const periodMatch = slot.match(/^(.+?) \(\d+:\d+ [AP]M/);

    if (timeMatch) {
      const [_, startTime, endTime] = timeMatch;
      // Convert AM/PM time back to 24-hour format for the input
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
        period: periodMatch ? periodMatch[1] : "",
      });
      setEditingTimeSlotIndex(index);
      setShowTimeSlotForm(true);
    }
  };

  // Remove time slot
  const handleRemoveTimeSlot = async (index) => {
    const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
    const updatedTimetable = { ...timetable, timeSlots: updatedTimeSlots };

    if (await saveTimetable(updatedTimetable)) {
      setTimeSlots(updatedTimeSlots);
      setTimetable(updatedTimetable);
      toast.success("Time slot removed successfully");
    }
  };

  // Clear entire timetable
  const handleClearAll = async () => {
    if (!selectedClass) {
      toast.warning("Please select a class first");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">School Timetable</h1>
          <p className="text-blue-100">
            Manage your class schedule efficiently
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-b-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Schedule Entry
            </h2>
            {selectedClass && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTimeSlotForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  + Add Time Slot
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
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
                  className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedClass || "Select a class"}
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
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
                  className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedClass}
                >
                  {teacherName || "Select a teacher"}
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
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
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
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
                      setNewTimeSlot({ ...newTimeSlot, start: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      setNewTimeSlot({ ...newTimeSlot, end: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      setNewTimeSlot({ ...newTimeSlot, period: e.target.value })
                    }
                    placeholder="e.g., Morning Session"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleSaveTimeSlot}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    {editingTimeSlotIndex !== null ? "Update" : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowTimeSlotForm(false);
                      setNewTimeSlot({ start: "", end: "", period: "" });
                      setEditingTimeSlotIndex(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
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
                    className="relative bg-blue-100 rounded-lg px-3 py-1 text-sm flex items-center"
                  >
                    {slot}
                    <div className="ml-2 flex gap-1">
                      <button
                        onClick={() => handleEditTimeSlot(index)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        ×
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!selectedClass || !editingSubject}
                  className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${
                    !selectedClass || !editingSubject
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-md"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save
                </button>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timetable Table Display */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {!selectedClass ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Please select a class to view or edit its timetable
              </div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Create time slots to begin building the timetable for{" "}
                {selectedClass}
              </div>
              <button
                onClick={() => setShowTimeSlotForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Your First Time Slot
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Timetable for {selectedClass}
                </h3>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Print Timetable
                </button>
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
                  {timeSlots.map((period, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {period}
                      </td>
                      {days.map((day) => {
                        const isSelected =
                          selectedCell?.day === day &&
                          selectedCell?.period === period;
                        const cellData = timetable[day]?.[period];

                        return (
                          <td
                            key={`${day}-${period}`}
                            className={`px-4 py-3 text-center cursor-pointer ${
                              isSelected
                                ? "bg-blue-100 ring-2 ring-blue-400"
                                : "hover:bg-blue-50"
                            } ${cellData ? "bg-blue-50" : ""}`}
                            onClick={() =>
                              handleCellClick(day, period, cellData)
                            }
                          >
                            {cellData ? (
                              <div className="group relative py-2 px-3 rounded-lg bg-white shadow-xs border border-blue-100">
                                <div className="font-medium text-blue-800 truncate">
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
                                    handleClearCell(day, period);
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
                                    ? "text-blue-600 font-medium"
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
      </div>
    </div>
  );
};

export default Timetable;
