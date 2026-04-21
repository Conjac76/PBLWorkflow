import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { StudentPage } from "./pages/StudentPage";
import { TeacherPage } from "./pages/TeacherPage";
export const App = () => {
    return (_jsxs("div", { children: [_jsxs("header", { className: "topbar", children: [_jsx("h1", { children: "PBL Workflow Tool" }), _jsxs("nav", { children: [_jsx(Link, { to: "/student", children: "Student" }), _jsx(Link, { to: "/teacher", children: "Teacher" })] })] }), _jsx("main", { className: "page", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/student", element: _jsx(StudentPage, {}) }), _jsx(Route, { path: "/teacher", element: _jsx(TeacherPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/student", replace: true }) })] }) })] }));
};
