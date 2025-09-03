import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  ArrowDownIcon,
  CalendarIcon,
  DocumentIcon,
  UserIcon,
  DocumentTextIcon,
} from "./Icons"; // Assuming you've extracted icons to a separate file

export default function ViewOnlyNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(collection(db, "notices"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
        }));
        setNotices(docs);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError("Failed to load notices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Important announcements and updates
          </p>
        </header>

        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <DocumentTextIcon />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No notices yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Check back later for updates
              </p>
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {notice.title}
                        </h3>
                        {notice.fileUrl && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Attachment
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 whitespace-pre-line mb-3">
                        {notice.description}
                      </p>

                      <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-2">
                        <span className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {notice.createdByName || "Unknown"}
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {notice.date?.toLocaleDateString()} at{" "}
                          {notice.date?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {notice.fileSize && (
                          <span className="flex items-center">
                            <DocumentIcon className="h-3 w-3 mr-1" />
                            {Math.round(notice.fileSize / 1024)}KB
                          </span>
                        )}
                      </div>
                    </div>

                    {notice.fileUrl && (
                      <div className="flex flex-col items-end gap-2">
                        <a
                          href={notice.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
