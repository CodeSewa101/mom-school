import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  Filter,
  UserPlus,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  limit,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(20);
  const [totalStudents, setTotalStudents] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [snapshotDocs, setSnapshotDocs] = useState([]);

  // Academic years from 2024-25 to 2030-31
  const academicYears = [
    '2024-25',
    '2025-26', 
    '2026-27',
    '2027-28',
    '2028-29',
    '2029-30',
    '2030-31'
  ];

  const classes = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    rollNumber: '',
    birthDate: '',
    address: '',
    parentName: '',
    parentPhone: '',
    photo: '',
    academicYear: academicYears[0],
    admissionDate: '',
    bloodGroup: '',
    emergencyContact: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchTotalStudents();
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterClass]);

  const fetchTotalStudents = async () => {
    try {
      const coll = collection(db, 'students');
      const snapshot = await getCountFromServer(coll);
      setTotalStudents(snapshot.data().count);
    } catch (error) {
      console.error('Error fetching total students:', error);
    }
  };

  const fetchStudents = async (pageDirection = 'first', lastDoc = null) => {
    try {
      setLoading(true);
      let q;
      const studentsRef = collection(db, 'students');
      
      if (pageDirection === 'first') {
        q = query(studentsRef, orderBy('name'), limit(studentsPerPage));
        setCurrentPage(1);
      } else if (pageDirection === 'next' && lastVisible) {
        q = query(studentsRef, orderBy('name'), startAfter(lastVisible), limit(studentsPerPage));
        setCurrentPage(prev => prev + 1);
      } else if (pageDirection === 'prev' && firstVisible) {
        q = query(studentsRef, orderBy('name'), limit(studentsPerPage));
        setCurrentPage(prev => prev - 1);
      } else if (pageDirection === 'last') {
        q = query(studentsRef, orderBy('name'), limit(studentsPerPage));
        setCurrentPage(Math.ceil(totalStudents / studentsPerPage));
      } else {
        q = query(studentsRef, orderBy('name'), limit(studentsPerPage));
      }
      
      const snapshot = await getDocs(q);
      const studentData = [];
      const docs = [];
      
      snapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() });
        docs.push(doc);
      });
      
      setStudents(studentData);
      setFilteredStudents(studentData);
      setSnapshotDocs(docs);
      
      if (docs.length > 0) {
        setFirstVisible(docs[0]);
        setLastVisible(docs[docs.length - 1]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClass) {
      filtered = filtered.filter(student => student.class === filterClass);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (name === 'password' || name === 'confirmPassword') {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Only validate password fields when adding a new student
    if (!editingStudent) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        photo: photoUrl
      }));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form only for new students
    if (!editingStudent && !validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      const studentData = { ...formData };
      
      // Remove password fields if editing (we don't want to update password unless specifically changing it)
      if (editingStudent) {
        delete studentData.password;
        delete studentData.confirmPassword;
        
        await updateDoc(doc(db, 'students', editingStudent.id), {
          ...studentData,
          updatedAt: new Date()
        });
        toast.success('Student updated successfully');
      } else {
        // For new students, include password but remove confirmPassword
        delete studentData.confirmPassword;
        
        await addDoc(collection(db, 'students'), {
          ...studentData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success('Student added successfully');
      }
      
      resetForm();
      fetchStudents();
      fetchTotalStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      ...student,
      password: '', // Clear password fields when editing
      confirmPassword: ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await deleteDoc(doc(db, 'students', studentId));
      toast.success('Student deleted successfully');
      fetchStudents();
      fetchTotalStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      rollNumber: '',
      birthDate: '',
      address: '',
      parentName: '',
      parentPhone: '',
      photo: '',
      academicYear: academicYears[0],
      admissionDate: '',
      bloodGroup: '',
      emergencyContact: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({
      password: '',
      confirmPassword: ''
    });
    setEditingStudent(null);
    setShowAddModal(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const promoteStudents = async () => {
    if (!window.confirm('Are you sure you want to promote all students to the next class and academic year?')) return;
    
    try {
      const batch = [];
      students.forEach(student => {
        const currentClass = parseInt(student.class);
        const studentYearIndex = academicYears.indexOf(student.academicYear);
        const updates = {
          updatedAt: new Date()
        };
        
        // Promote class if not already in the highest class (12)
        if (currentClass < 12) {
          updates.class = (currentClass + 1).toString();
        }
        
        // Promote academic year if not already at the last year
        if (studentYearIndex < academicYears.length - 1) {
          updates.academicYear = academicYears[studentYearIndex + 1];
        }
        
        // Only update if either class or year was promoted
        if (Object.keys(updates).length > 1) {
          batch.push(
            updateDoc(doc(db, 'students', student.id), updates)
          );
        }
      });
      
      await Promise.all(batch);
      toast.success('Students promoted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error promoting students:', error);
      toast.error('Failed to promote students');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg w-64"></div>
            <div className="bg-white rounded-xl p-6 h-96 shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalFilteredPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">Manage student records and information</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={promoteStudents}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all flex items-center space-x-2 shadow-sm"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Promote All</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Updated with different colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">Total Students</h3>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">This Year</h3>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.academicYear === academicYears[0]).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Filter className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">Filtered</h3>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center justify-center md:justify-end">
              <span className="bg-gray-100 px-3 py-1.5 rounded-lg">
                Showing {filteredStudents.length > 0 ? indexOfFirstStudent + 1 : 0}-{Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
              </span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Section
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                              src={student.photo || 'https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={student.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Class {student.class}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Section {student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.academicYear}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.parentName}</div>
                        <div className="text-sm text-gray-500">{student.parentPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit student"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg font-medium">No students found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add New Student</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredStudents.length > studentsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastStudent, filteredStudents.length)}
              </span>{' '}
              of <span className="font-medium">{filteredStudents.length}</span> results
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 transition-colors'}`}
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 transition-colors'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                let pageNum;
                if (totalFilteredPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalFilteredPages - 2) {
                  pageNum = totalFilteredPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 transition-colors'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalFilteredPages || filteredStudents.length === 0}
                className={`p-2 rounded-lg ${currentPage === totalFilteredPages || filteredStudents.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 transition-colors'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => paginate(totalFilteredPages)}
                disabled={currentPage === totalFilteredPages || filteredStudents.length === 0}
                className={`p-2 rounded-lg ${currentPage === totalFilteredPages || filteredStudents.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 transition-colors'}`}
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  {editingStudent ? (
                    <>
                      <Edit className="h-6 w-6 text-blue-600" />
                      Edit Student
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-6 w-6 text-blue-600" />
                      Add New Student
                    </>
                  )}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Photo
                      </label>
                      <div className="flex items-center space-x-4">
                        {formData.photo && (
                          <img
                            src={formData.photo}
                            alt="Student"
                            className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:shadow-md transition-all cursor-pointer flex items-center space-x-2 shadow-sm"
                          >
                            <Upload className="h-4 w-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Password Fields - Only show for new students */}
                    {!editingStudent && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {formErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {formErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Academic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class *
                      </label>
                      <select
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section *
                      </label>
                      <select
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>Section {section}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year *
                      </label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {academicYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Parent Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent/Guardian Name
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Phone
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-md transition-all shadow-sm"
                    >
                      {editingStudent ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}