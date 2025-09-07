import { Outlet } from "react-router-dom";

import StudentHeader from "./StudentHeader";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentHeader />
      
    </div>
  );
}
