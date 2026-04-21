import { Link, Navigate, Route, Routes } from "react-router-dom";
import { StudentPage } from "./pages/StudentPage";
import { TeacherPage } from "./pages/TeacherPage";

export const App = () => {
  return (
    <div>
      <header className="topbar">
        <h1>PBL Workflow Tool</h1>
        <nav>
          <Link to="/student">Student</Link>
          <Link to="/teacher">Teacher</Link>
        </nav>
      </header>
      <main className="page">
        <Routes>
          <Route path="/student" element={<StudentPage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </main>
    </div>
  );
};
