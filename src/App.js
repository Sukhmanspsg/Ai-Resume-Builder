import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeEditor from './pages/ResumeEditor';
import AdminPanel from './pages/AdminPanel';
import Signup from './pages/Signup';
import Activate from './pages/Activate';
import MyResumes from './pages/MyResumes';
import EditResume from './pages/EditResume';import ResumePreview from './pages/ResumePreview';
import CoverLetter from './pages/CoverLetter';
import Templates from './pages/Templates';



// import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/activate/:token" element={<Activate />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<ResumeEditor />} />
        <Route path="/MyResumes" element={<MyResumes />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/edit-resume/:id" element={<EditResume />} />
        <Route path="/resume-preview" element={<ResumePreview />} />
        <Route path="/CoverLetter" element={<CoverLetter />} />
        <Route path="/templates" element={<Templates />} />

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

