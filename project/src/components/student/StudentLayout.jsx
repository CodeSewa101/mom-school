import { Outlet } from "react-router-dom";
import StudentHeader from "./StudentHeader";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
