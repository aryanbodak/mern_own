import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Home           from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import CoursePlayer   from "./pages/CoursePlayer";
import MongoOutput    from "./pages/MongoOutput";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/home"           element={<Home />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/course/:id"     element={<CoursePlayer />} />
        <Route path="/debug"          element={<MongoOutput />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
