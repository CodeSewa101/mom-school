import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

const ResultsPage = () => {
  const { currentUser, userRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    maxMarks: 100,
    obtainedMarks: "",
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    class: "",
    subjects: [],
    imageUrl: "",
  });

  // Check if user is admin
  const isAdmin = userRole === "admin";

  // Fetch students from Firebase
  useEffect(() => {
    fetchStudents();
  }, [classFilter, isAdmin, currentUser]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let q;

      // If user is a student, only fetch their data
      if (!isAdmin && currentUser) {
        // Assuming student documents have a userId field that matches currentUser.uid
        q = query(
          collection(db, "students"),
          where("userId", "==", currentUser.uid)
        );
      } else if (classFilter) {
        q = query(
          collection(db, "students"),
          where("class", "==", classFilter)
        );
      } else {
        q = collection(db, "students");
      }

      const querySnapshot = await getDocs(q);
      const studentsData = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() });
      });

      setStudents(studentsData);

      // If user is a student, automatically select their record
      if (!isAdmin && studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
      } else if (isAdmin && studentsData.length > 0 && !selectedStudent) {
        // For admin, select the first student by default if none is selected
        setSelectedStudent(studentsData[0]);
      }
    } catch (error) {
      console.error("Error fetching students: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for selected student
  const totalMaxMarks = selectedStudent
    ? selectedStudent.subjects.reduce(
        (sum, subject) => sum + parseInt(subject.maxMarks || 0),
        0
      )
    : 0;

  const totalObtainedMarks = selectedStudent
    ? selectedStudent.subjects.reduce(
        (sum, subject) => sum + (parseInt(subject.obtainedMarks) || 0),
        0
      )
    : 0;

  const percentage =
    totalMaxMarks > 0
      ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2)
      : 0;

  // Determine grade based on percentage
  const getGrade = () => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  // Determine pass/fail status
  const getStatus = () => {
    return percentage >= 40 ? "Pass" : "Fail";
  };

  // Handle class filter change (admin only)
  const handleClassFilterChange = (e) => {
    setClassFilter(e.target.value);
    setSelectedStudent(null);
  };

  // Handle student selection (admin only)
  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
    setIsEditingStudent(false);
  };

  // Handle new student input change
  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value,
    });
  };

  // Handle editing student input change
  const handleEditStudentChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent({
      ...editingStudent,
      [name]: value,
    });
  };

  // Handle new subject input change
  const handleNewSubjectChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({
      ...newSubject,
      [name]: value,
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(
        storage,
        `student-images/${Date.now()}-${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (isEditingStudent) {
        setEditingStudent({
          ...editingStudent,
          imageUrl: downloadURL,
        });
      } else {
        setNewStudent({
          ...newStudent,
          imageUrl: downloadURL,
        });
      }

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Add a new subject to the new student
  const addNewSubject = () => {
    if (!newSubject.name || !newSubject.maxMarks) {
      alert("Please enter subject name and maximum marks");
      return;
    }

    setNewStudent({
      ...newStudent,
      subjects: [...newStudent.subjects, { ...newSubject }],
    });

    setNewSubject({
      name: "",
      maxMarks: 100,
      obtainedMarks: "",
    });

    setIsAddingSubject(false);
  };

  // Add a new subject to the editing student
  const addNewSubjectToEdit = () => {
    if (!newSubject.name || !newSubject.maxMarks) {
      alert("Please enter subject name and maximum marks");
      return;
    }

    setEditingStudent({
      ...editingStudent,
      subjects: [...editingStudent.subjects, { ...newSubject }],
    });

    setNewSubject({
      name: "",
      maxMarks: 100,
      obtainedMarks: "",
    });

    setIsAddingSubject(false);
  };

  // Remove a subject from the new student
  const removeSubject = (index) => {
    const updatedSubjects = [...newStudent.subjects];
    updatedSubjects.splice(index, 1);
    setNewStudent({
      ...newStudent,
      subjects: updatedSubjects,
    });
  };

  // Remove a subject from the editing student
  const removeSubjectFromEdit = (index) => {
    const updatedSubjects = [...editingStudent.subjects];
    updatedSubjects.splice(index, 1);
    setEditingStudent({
      ...editingStudent,
      subjects: updatedSubjects,
    });
  };

  // Handle subject marks change for new student
  const handleSubjectMarksChange = (index, e) => {
    const updatedSubjects = [...newStudent.subjects];
    const value = Math.min(
      parseInt(e.target.value) || 0,
      parseInt(updatedSubjects[index].maxMarks)
    );

    updatedSubjects[index].obtainedMarks = value;
    setNewStudent({
      ...newStudent,
      subjects: updatedSubjects,
    });
  };

  // Handle subject marks change for editing student
  const handleEditSubjectMarksChange = (index, e) => {
    const updatedSubjects = [...editingStudent.subjects];
    const value = Math.min(
      parseInt(e.target.value) || 0,
      parseInt(updatedSubjects[index].maxMarks)
    );

    updatedSubjects[index].obtainedMarks = value;
    setEditingStudent({
      ...editingStudent,
      subjects: updatedSubjects,
    });
  };

  // Handle subject max marks change for new student
  const handleSubjectMaxMarksChange = (index, e) => {
    const updatedSubjects = [...newStudent.subjects];
    const value = parseInt(e.target.value) || 100;

    updatedSubjects[index].maxMarks = value;

    // If obtained marks exceed new max marks, adjust them
    if (parseInt(updatedSubjects[index].obtainedMarks) > value) {
      updatedSubjects[index].obtainedMarks = value;
    }

    setNewStudent({
      ...newStudent,
      subjects: updatedSubjects,
    });
  };

  // Handle subject max marks change for editing student
  const handleEditSubjectMaxMarksChange = (index, e) => {
    const updatedSubjects = [...editingStudent.subjects];
    const value = parseInt(e.target.value) || 100;

    updatedSubjects[index].maxMarks = value;

    // If obtained marks exceed new max marks, adjust them
    if (parseInt(updatedSubjects[index].obtainedMarks) > value) {
      updatedSubjects[index].obtainedMarks = value;
    }

    setEditingStudent({
      ...editingStudent,
      subjects: updatedSubjects,
    });
  };

  // Handle subject name change for editing student
  const handleEditSubjectNameChange = (index, e) => {
    const updatedSubjects = [...editingStudent.subjects];
    updatedSubjects[index].name = e.target.value;
    setEditingStudent({
      ...editingStudent,
      subjects: updatedSubjects,
    });
  };

  // Save new student to Firebase
  const saveNewStudent = async () => {
    try {
      // Validate all fields are filled
      if (!newStudent.name || !newStudent.rollNo || !newStudent.class) {
        alert("Please fill all student details");
        return;
      }

      // Validate at least one subject is added
      if (newStudent.subjects.length === 0) {
        alert("Please add at least one subject");
        return;
      }

      // Validate all marks are entered
      const incompleteMarks = newStudent.subjects.some(
        (subject) =>
          subject.obtainedMarks === "" || isNaN(subject.obtainedMarks)
      );

      if (incompleteMarks) {
        alert("Please enter marks for all subjects");
        return;
      }

      // Convert marks to numbers
      const studentToSave = {
        ...newStudent,
        subjects: newStudent.subjects.map((subject) => ({
          ...subject,
          maxMarks: parseInt(subject.maxMarks),
          obtainedMarks: parseInt(subject.obtainedMarks),
        })),
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, "students"), studentToSave);
      console.log("Document written with ID: ", docRef.id);

      // Reset form and refresh student list
      setNewStudent({
        name: "",
        rollNo: "",
        class: "",
        subjects: [],
        imageUrl: "",
      });

      setIsAddingStudent(false);
      fetchStudents(); // Refresh the list
      alert("Student data saved successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error saving student data");
    }
  };

  // Start editing a student
  const startEditingStudent = () => {
    if (!selectedStudent) {
      alert("Please select a student to edit");
      return;
    }
    setEditingStudent({ ...selectedStudent });
    setIsEditingStudent(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditingStudent(false);
    setEditingStudent(null);
  };

  // Update student in Firebase
  const updateStudent = async () => {
    try {
      // Validate all fields are filled
      if (
        !editingStudent.name ||
        !editingStudent.rollNo ||
        !editingStudent.class
      ) {
        alert("Please fill all student details");
        return;
      }

      // Validate at least one subject is added
      if (editingStudent.subjects.length === 0) {
        alert("Please add at least one subject");
        return;
      }

      // Validate all marks are entered
      const incompleteMarks = editingStudent.subjects.some(
        (subject) =>
          subject.obtainedMarks === "" || isNaN(subject.obtainedMarks)
      );

      if (incompleteMarks) {
        alert("Please enter marks for all subjects");
        return;
      }

      // Convert marks to numbers
      const studentToUpdate = {
        ...editingStudent,
        subjects: editingStudent.subjects.map((subject) => ({
          ...subject,
          maxMarks: parseInt(subject.maxMarks),
          obtainedMarks: parseInt(subject.obtainedMarks),
        })),
      };

      // Update in Firebase
      const studentDoc = doc(db, "students", editingStudent.id);
      await updateDoc(studentDoc, studentToUpdate);

      setIsEditingStudent(false);
      setSelectedStudent(studentToUpdate);
      fetchStudents(); // Refresh the list
      alert("Student data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error updating student data");
    }
  };

  // Delete student from Firebase
  const deleteStudent = async () => {
    if (!selectedStudent) {
      alert("Please select a student to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedStudent.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const studentDoc = doc(db, "students", selectedStudent.id);
      await deleteDoc(studentDoc);

      setSelectedStudent(null);
      fetchStudents(); // Refresh the list
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Error deleting student");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          {isAdmin ? "Student Results Management" : "My Results"}
        </h1>

        {/* Admin Controls - Only show if user is admin */}
        {isAdmin && (
          <>
            {/* Add New Student Button */}
            <div className="mb-6 text-center">
              <button
                onClick={() => setIsAddingStudent(!isAddingStudent)}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mr-2"
              >
                {isAddingStudent ? "Cancel" : "Add New Student"}
              </button>

              {selectedStudent && !isEditingStudent && (
                <>
                  <button
                    onClick={startEditingStudent}
                    className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 mr-2"
                  >
                    Edit Student
                  </button>
                  <button
                    onClick={deleteStudent}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Student
                  </button>
                </>
              )}
            </div>

            {/* Add New Student Form */}
            {isAddingStudent && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Add New Student
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newStudent.name}
                      onChange={handleNewStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Student Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll No
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={newStudent.rollNo}
                      onChange={handleNewStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Roll No"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      name="class"
                      value={newStudent.class}
                      onChange={handleNewStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {[
                        "Pre-K",
                        "Kindergarten",
                        ...Array.from(
                          { length: 10 },
                          (_, i) => `Class ${i + 1}`
                        ),
                      ].map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer mr-3"
                    >
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </label>
                    {newStudent.imageUrl && (
                      <div className="flex items-center">
                        <span className="text-sm text-green-600 mr-2">
                          ✓ Image Uploaded
                        </span>
                        <img
                          src={newStudent.imageUrl}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Subjects
                </h3>

                {/* Add Subject Button */}
                <div className="mb-4">
                  <button
                    onClick={() => setIsAddingSubject(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    + Add Subject
                  </button>
                </div>

                {/* Add Subject Form */}
                {isAddingSubject && (
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Add New Subject
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newSubject.name}
                          onChange={handleNewSubjectChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Subject Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Marks
                        </label>
                        <input
                          type="number"
                          name="maxMarks"
                          value={newSubject.maxMarks}
                          onChange={handleNewSubjectChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Max Marks"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addNewSubject}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setIsAddingSubject(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subjects List */}
                {newStudent.subjects.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Added Subjects
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {newStudent.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg shadow-sm relative"
                        >
                          <button
                            onClick={() => removeSubject(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Name
                            </label>
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) => {
                                const updatedSubjects = [
                                  ...newStudent.subjects,
                                ];
                                updatedSubjects[index].name = e.target.value;
                                setNewStudent({
                                  ...newStudent,
                                  subjects: updatedSubjects,
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Marks
                              </label>
                              <input
                                type="number"
                                value={subject.maxMarks}
                                onChange={(e) =>
                                  handleSubjectMaxMarksChange(index, e)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Obtained Marks
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={subject.maxMarks}
                                value={subject.obtainedMarks}
                                onChange={(e) =>
                                  handleSubjectMarksChange(index, e)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p className="text-yellow-700">
                      No subjects added yet. Click "Add Subject" to get started.
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={saveNewStudent}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Student Data
                  </button>
                </div>
              </div>
            )}

            {/* Edit Student Form */}
            {isEditingStudent && editingStudent && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Edit Student: {editingStudent.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingStudent.name}
                      onChange={handleEditStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Student Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll No
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={editingStudent.rollNo}
                      onChange={handleEditStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Roll No"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      name="class"
                      value={editingStudent.class}
                      onChange={handleEditStudentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {[
                        "Pre-K",
                        "Kindergarten",
                        ...Array.from(
                          { length: 10 },
                          (_, i) => `Class ${i + 1}`
                        ),
                      ].map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload Section for Editing */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Photo (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer mr-3"
                    >
                      {uploadingImage ? "Uploading..." : "Upload/Change Image"}
                    </label>
                    {editingStudent.imageUrl && (
                      <div className="flex items-center">
                        <span className="text-sm text-green-600 mr-2">
                          ✓ Image Uploaded
                        </span>
                        <img
                          src={editingStudent.imageUrl}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Subjects
                </h3>

                {/* Add Subject Button */}
                <div className="mb-4">
                  <button
                    onClick={() => setIsAddingSubject(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    + Add Subject
                  </button>
                </div>

                {/* Add Subject Form */}
                {isAddingSubject && (
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Add New Subject
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newSubject.name}
                          onChange={handleNewSubjectChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Subject Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Marks
                        </label>
                        <input
                          type="number"
                          name="maxMarks"
                          value={newSubject.maxMarks}
                          onChange={handleNewSubjectChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Max Marks"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addNewSubjectToEdit}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setIsAddingSubject(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subjects List */}
                {editingStudent.subjects.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      Subjects
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editingStudent.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg shadow-sm relative"
                        >
                          <button
                            onClick={() => removeSubjectFromEdit(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Name
                            </label>
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) =>
                                handleEditSubjectNameChange(index, e)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Marks
                              </label>
                              <input
                                type="number"
                                value={subject.maxMarks}
                                onChange={(e) =>
                                  handleEditSubjectMaxMarksChange(index, e)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Obtained Marks
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={subject.maxMarks}
                                value={subject.obtainedMarks}
                                onChange={(e) =>
                                  handleEditSubjectMarksChange(index, e)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p className="text-yellow-700">
                      No subjects added yet. Click "Add Subject" to get started.
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={updateStudent}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-2"
                  >
                    Update Student Data
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Filters - Only show for admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Class
                </label>
                <select
                  value={classFilter}
                  onChange={handleClassFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {[
                    "Pre-K",
                    "Kindergarten",
                    ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
                  ].map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={handleStudentSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={
                    loading || students.length === 0 || isEditingStudent
                  }
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Roll No: {student.rollNo}, Class:{" "}
                      {student.class})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">
              {isAdmin ? "Loading students..." : "Loading your results..."}
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 bg-yellow-50 rounded-lg">
            <p className="text-yellow-700">
              {isAdmin
                ? classFilter
                  ? `No students found in ${classFilter}`
                  : "No students found. Add a new student using the button above."
                : "No results found for your account."}
            </p>
          </div>
        ) : selectedStudent && !isEditingStudent ? (
          <>
            {/* Student Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {selectedStudent.class}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll No
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {selectedStudent.rollNo}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {selectedStudent.name}
                </div>
              </div>
            </div>

            {/* Student Photo Display */}
            {selectedStudent.imageUrl && (
              <div className="mb-8 flex justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Student Photo
                  </h3>
                  <img
                    src={selectedStudent.imageUrl}
                    alt={selectedStudent.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
                  />
                </div>
              </div>
            )}

            {/* Marks Display Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Subject Marks
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obtained Marks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStudent.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subject.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subject.maxMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subject.obtainedMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results Summary Section */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Results Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Total Max Marks</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalMaxMarks}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Total Obtained Marks</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalObtainedMarks}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {percentage}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {getGrade()}
                  </p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <span
                  className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                    getStatus() === "Pass"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Status: {getStatus()}
                </span>
              </div>
            </div>
          </>
        ) : !isEditingStudent && isAdmin ? (
          <div className="text-center py-8 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              Please select a student to view results
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResultsPage;
