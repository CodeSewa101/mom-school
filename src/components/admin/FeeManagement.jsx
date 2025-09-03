import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Users,
  X,
  Calendar,
  CreditCard,
  BookOpen,
  Edit,
  Save,
  Trash2,
  Eye,
} from "lucide-react";

const FeeManagement = () => {
  // Default fee structure for all classes
  const defaultFeeStructure = {
    admission: 10000,
    tuition: 30000,
    uniform: 5000,
    transport: 5000,
    examination: 3000,
    activity: 2000,
    other: 0,
    total: 55000,
  };

  // Initialize empty class fees for Pre-K to 10
  const initialClassFees = Array.from({ length: 13 }, (_, i) => {
    const className = i === 0 ? "Pre-K" : i === 12 ? "10" : `${i}`;
    return {
      id: `${i + 1}`,
      className,
      feeStructure: { ...defaultFeeStructure },
      totalCollected: 0,
      totalExpected: defaultFeeStructure.total,
      feePayments: [],
      lastPayment: "",
      status: "Unpaid",
    };
  });

  const [classFees, setClassFees] = useState(initialClassFees);
  const [filteredClassFees, setFilteredClassFees] = useState(initialClassFees);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [feeType, setFeeType] = useState("tuition");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [customFeeStructure, setCustomFeeStructure] = useState({});
  const [newClassName, setNewClassName] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(10);

  const feeTypes = [
    {
      id: "admission",
      name: "Admission Fee",
      description: "One-time admission charges",
    },
    {
      id: "tuition",
      name: "Tuition Fee",
      description: "Regular tuition charges",
    },
    {
      id: "uniform",
      name: "Uniform Fee",
      description: "School uniform charges",
    },
    {
      id: "transport",
      name: "Transport Fee",
      description: "School bus transportation charges",
    },
    {
      id: "examination",
      name: "Examination Fee",
      description: "Exam related charges",
    },
    {
      id: "activity",
      name: "Activity Fee",
      description: "Extra-curricular activities",
    },
    {
      id: "other",
      name: "Other Fee",
      description: "Miscellaneous charges",
    },
  ];

  useEffect(() => {
    filterClasses();
  }, [classFees, searchTerm, selectedClass]);

  const fetchClasses = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const calculateStatus = (totalExpected, totalCollected) => {
    if (totalExpected === 0) return "Not Set";
    if (totalCollected >= totalExpected) return "Paid";
    if (totalCollected > 0) return "Partial";
    return "Unpaid";
  };

  const filterClasses = () => {
    let filtered = [...classFees];

    if (searchTerm) {
      filtered = filtered.filter((classFee) =>
        classFee.className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass && selectedClass !== "All Classes") {
      filtered = filtered.filter(
        (classFee) => classFee.className === selectedClass
      );
    }

    setFilteredClassFees(filtered);
    setCurrentPage(1);
  };

  const handlePayment = (classData) => {
    setCurrentClass(classData);
    setPaymentAmount("");
    setFeeType("tuition");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentDescription("");
    setShowModal(true);
  };

  const viewFeeStructure = (classData) => {
    setCurrentClass(classData);
    setShowFeeStructureModal(true);
  };

  const viewPaymentHistory = (classData) => {
    setCurrentClass(classData);
    setShowPaymentHistoryModal(true);
  };

  const customizeFeeStructure = (classData) => {
    setCurrentClass(classData);
    setCustomFeeStructure({ ...classData.feeStructure });
    setIsEditing(false);
    setShowCustomizeModal(true);
  };

  const processPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (Number(paymentAmount) > getRemainingForFeeType()) {
      alert("Payment amount cannot exceed remaining balance");
      return;
    }

    try {
      const amount = Number(paymentAmount);
      const newCollectedAmount = currentClass.totalCollected + amount;
      const newStatus = calculateStatus(
        currentClass.totalExpected,
        newCollectedAmount
      );

      // Update local state
      const updatedClasses = classFees.map((classFee) => {
        if (classFee.id === currentClass.id) {
          return {
            ...classFee,
            totalCollected: newCollectedAmount,
            feePayments: [
              ...classFee.feePayments,
              {
                type: feeType,
                amount: amount,
                date: paymentDate,
                description:
                  paymentDescription ||
                  `${feeTypes.find((f) => f.id === feeType)?.name} Collection`,
              },
            ],
            lastPayment: paymentDate,
            status: newStatus,
          };
        }
        return classFee;
      });

      setClassFees(updatedClasses);
      setShowModal(false);
      alert(
        `Payment of ₹${amount.toLocaleString("en-IN")} recorded for Class ${
          currentClass.className
        }`
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to record payment");
    }
  };

  const saveCustomFeeStructure = () => {
    const updatedClasses = classFees.map((classFee) => {
      if (classFee.id === currentClass.id) {
        const newTotal = Object.values(customFeeStructure)
          .filter((_, i) => i < Object.values(customFeeStructure).length - 1) // Exclude total from calculation
          .reduce((sum, value) => sum + value, 0);

        return {
          ...classFee,
          feeStructure: { ...customFeeStructure, total: newTotal },
          totalExpected: newTotal,
          status: calculateStatus(newTotal, classFee.totalCollected),
        };
      }
      return classFee;
    });

    setClassFees(updatedClasses);
    setShowCustomizeModal(false);
    alert("Fee structure updated successfully!");
  };

  const addNewClass = () => {
    if (!newClassName) {
      alert("Please enter a class name");
      return;
    }

    // Check if class already exists
    if (classFees.some((c) => c.className === newClassName)) {
      alert("Class already exists");
      return;
    }

    const newClass = {
      id: `${classFees.length + 1}`,
      className: newClassName,
      feeStructure: { ...defaultFeeStructure },
      totalCollected: 0,
      totalExpected: defaultFeeStructure.total,
      feePayments: [],
      lastPayment: "",
      status: "Unpaid",
    };

    setClassFees([...classFees, newClass]);
    setNewClassName("");
    setShowAddClassModal(false);
    alert(`Class ${newClassName} added successfully!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Not Set":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  // Calculate remaining amount for selected fee type
  const getRemainingForFeeType = () => {
    if (!currentClass) return 0;

    const feeTypeData = feeTypes.find((f) => f.id === feeType);
    if (!feeTypeData) return 0;

    // For fees that have specific amounts in class.feeStructure
    if (currentClass.feeStructure[feeType]) {
      const paidForThisType = currentClass.feePayments
        .filter((p) => p.type === feeType)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const expectedForThisType = currentClass.feeStructure[feeType];
      return expectedForThisType - paidForThisType;
    }

    // For other fee types, just show the overall balance
    return currentClass.totalExpected - currentClass.totalCollected;
  };

  // Pagination calculations
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClassFees.slice(
    indexOfFirstClass,
    indexOfLastClass
  );
  const totalPages = Math.ceil(filteredClassFees.length / classesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedClass("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="bg-white rounded-lg p-6 h-96 flex items-center justify-center">
              <p className="text-gray-500">Loading class data...</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Class Fee Management
            </h1>
            <p className="text-gray-600 mt-2">Manage fees at class level</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowAddClassModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Class
            </button>
            <button
              onClick={fetchClasses}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Total Revenue
                </h2>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {classFees
                    .reduce((sum, classFee) => sum + classFee.totalCollected, 0)
                    .toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Fees
                </h2>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {classFees
                    .reduce(
                      (sum, classFee) =>
                        sum +
                        (classFee.totalExpected - classFee.totalCollected),
                      0
                    )
                    .toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Total Classes
                </h2>
                <p className="text-2xl font-bold text-gray-900">
                  {classFees.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by class"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Classes</option>
                  {classFees.map((classFee) => (
                    <option key={classFee.id} value={classFee.className}>
                      Class {classFee.className}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Reset Filters
              </button>

              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Class
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expected Fees
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Collected
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Balance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClasses.length > 0 ? (
                  currentClasses.map((classFee) => (
                    <tr key={classFee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-800 font-bold">
                              {classFee.className}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Class {classFee.className}
                            </div>
                            <div className="text-sm text-gray-500">
                              {classFee.feePayments.length} payments
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{classFee.totalExpected.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{classFee.totalCollected.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹
                        {(
                          classFee.totalExpected - classFee.totalCollected
                        ).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            classFee.status
                          )}`}
                        >
                          {classFee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classFee.lastPayment || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => viewFeeStructure(classFee)}
                          className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors"
                          title="View Fee Structure"
                        >
                          <Eye className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => customizeFeeStructure(classFee)}
                          className="text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-lg transition-colors"
                          title="Customize Fees"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => viewPaymentHistory(classFee)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
                          title="Payment History"
                        >
                          <CreditCard className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handlePayment(classFee)}
                          className="text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-lg transition-colors"
                          title="Record Payment"
                        >
                          <DollarSign className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No classes found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredClassFees.length > 0 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstClass + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastClass, filteredClassFees.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredClassFees.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span className="sr-only">First</span>
                      <ChevronsLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span className="sr-only">Last</span>
                      <ChevronsRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showModal && currentClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Record Payment for Class {currentClass.className}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Class: {currentClass.className}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Expected Fees</p>
                      <p className="font-medium text-lg">
                        ₹{currentClass.totalExpected.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Collected Amount</p>
                      <p className="font-medium text-lg">
                        ₹{currentClass.totalCollected.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="font-medium text-lg text-red-600">
                        ₹
                        {(
                          currentClass.totalExpected -
                          currentClass.totalCollected
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            currentClass.status
                          )}`}
                        >
                          {currentClass.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Type
                    </label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {feeTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {feeTypes.find((f) => f.id === feeType)?.description}
                    </p>
                  </div>

                  <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remaining for{" "}
                      {feeTypes.find((f) => f.id === feeType)?.name}
                    </label>
                    <p className="font-medium text-lg">
                      ₹{getRemainingForFeeType().toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Description
                    </label>
                    <input
                      type="text"
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      placeholder="Enter payment description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      max={getRemainingForFeeType()}
                      placeholder={`Enter amount up to ₹${getRemainingForFeeType().toLocaleString(
                        "en-IN"
                      )}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processPayment}
                      disabled={
                        !paymentAmount ||
                        paymentAmount <= 0 ||
                        paymentAmount > getRemainingForFeeType()
                      }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fee Structure Modal */}
        {showFeeStructureModal && currentClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Fee Structure for Class {currentClass.className}
                  </h2>
                  <button
                    onClick={() => setShowFeeStructureModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Class: {currentClass.className}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Fee Breakdown
                    </h3>
                    {Object.entries(currentClass.feeStructure).map(
                      ([key, value]) =>
                        key !== "total" && (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-gray-200"
                          >
                            <span className="text-gray-700 capitalize">
                              {key}:
                            </span>
                            <span className="font-medium">
                              ₹{value.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )
                    )}
                    <div className="flex justify-between items-center py-2 border-t border-gray-300 font-bold">
                      <span>Total:</span>
                      <span>
                        ₹
                        {currentClass.feeStructure.total.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowFeeStructureModal(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customize Fee Structure Modal */}
        {showCustomizeModal && currentClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Customize Fee Structure for Class {currentClass.className}
                  </h2>
                  <button
                    onClick={() => setShowCustomizeModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Class: {currentClass.className}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Fee Breakdown
                    </h3>
                    {Object.entries(customFeeStructure).map(
                      ([key, value]) =>
                        key !== "total" && (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-gray-200"
                          >
                            <span className="text-gray-700 capitalize">
                              {key}:
                            </span>
                            {isEditing ? (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) =>
                                  setCustomFeeStructure({
                                    ...customFeeStructure,
                                    [key]: Number(e.target.value),
                                  })
                                }
                                className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            ) : (
                              <span className="font-medium">
                                ₹{value.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        )
                    )}
                    <div className="flex justify-between items-center py-2 border-t border-gray-300 font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        ₹
                        {Object.entries(customFeeStructure)
                          .filter(([key]) => key !== "total")
                          .reduce((sum, [_, value]) => sum + value, 0)
                          .toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveCustomFeeStructure}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowCustomizeModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Fees
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Modal */}
        {showPaymentHistoryModal && currentClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment History for Class {currentClass.className}
                  </h2>
                  <button
                    onClick={() => setShowPaymentHistoryModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Class: {currentClass.className}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total Collected: ₹
                      {currentClass.totalCollected.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {currentClass.feePayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Description
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {currentClass.feePayments.map((payment, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {payment.date}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap capitalize">
                                {payment.type}
                              </td>
                              <td className="px-4 py-2">
                                {payment.description}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap font-medium">
                                ₹{payment.amount.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No payment history available
                    </p>
                  )}

                  <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowPaymentHistoryModal(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Class Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New Class
                  </h2>
                  <button
                    onClick={() => setShowAddClassModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Enter class name (e.g., Pre-K, 1, 2, etc.)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddClassModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Class
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;
