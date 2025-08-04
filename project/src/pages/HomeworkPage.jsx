import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { uploadToCloudinary } from "../config/cloudinary";
import toast from "react-hot-toast";

export default function Homework() {
  const [type, setType] = useState("homework");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const q = query(collection(db, type), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate() 
      }));
      setData(docs);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      toast.error("Failed to load data");
    }
  }, [type]);

  // Auth state and data fetching
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setUser(user);
        if (user) {
          fetchData();
        } else {
          setError("Please sign in to view content");
        }
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchData]);

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (loading || !user || !validateForm()) return;
    
    setLoading(true);
    setFileUploadProgress(0);
    const toastId = toast.loading("Uploading...");

    try {
      let fileData = null;
      if (file) {
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setFileUploadProgress(prev => Math.min(prev + 10, 90));
          }, 300);

          fileData = await uploadToCloudinary(file);
          clearInterval(progressInterval);
          setFileUploadProgress(100);
        } catch (uploadErr) {
          console.error("File upload failed:", uploadErr);
          throw new Error("File upload failed. Please try again.");
        }
      }

      const docData = {
        title: title.trim(),
        description: description.trim(),
        date: Timestamp.now(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
      };

      // Only add file-related fields if file was uploaded
      if (file && fileData) {
        docData.fileUrl = fileData.url;
        docData.filePublicId = fileData.publicId;
        docData.fileName = file.name;
        docData.fileSize = file.size;
        docData.fileType = file.type;
      }

      await addDoc(collection(db, type), docData);
      toast.success("Uploaded successfully!", { id: toastId });
      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
      toast.error(err.message || "Upload failed!", { id: toastId });
    } finally {
      setLoading(false);
      setFileUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Only JPG, PNG, PDF, or DOC files are allowed");
      return;
    }

    setFile(selectedFile);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to access homework and notices.</p>
          <button 
            onClick={() => auth.signInWithPopup(new auth.GoogleAuthProvider())}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {type === "homework" ? "Homework" : "Notices"} Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {type === "homework" 
              ? "Upload and manage homework assignments" 
              : "Post important notices for students"}
          </p>
          
          {/* Toggle Buttons */}
          <div className="mt-4 inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setType("homework")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                type === "homework"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Homework
            </button>
            <button
              type="button"
              onClick={() => setType("notices")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                type === "notices"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Notices
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-10">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {type === "homework" ? "Add New Homework" : "Create New Notice"}
            </h2>
            <form onSubmit={handleUpload}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment (Optional)
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Choose File
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    {file && (
                      <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                        {file.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, JPG, PNG (Max 5MB)
                  </p>
                  {fileUploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${fileUploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${type === "homework" ? "Homework" : "Notice"}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Display Uploaded Data */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {type === "homework" ? "Recent Homework" : "Latest Notices"}
            </h2>
            <span className="text-sm text-gray-500">
              {data.length} {type === "homework" ? "assignments" : "notices"} found
            </span>
          </div>

          {data.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No {type} available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {type === "homework" 
                  ? "Get started by uploading a new homework assignment." 
                  : "Create your first notice to share with students."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.id} className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{item.description}</p>
                        
                        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-2 gap-y-1">
                          <span>Posted by {item.createdByName || "Unknown"}</span>
                          <span>•</span>
                          <span>{item.date?.toLocaleDateString()} at {item.date?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                      
                      {item.fileUrl && (
                        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col items-end">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Download
                          </a>
                          {item.fileSize && (
                            <span className="mt-1 text-xs text-gray-500">
                              {Math.round(item.fileSize / 1024)}KB • {item.fileType?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}