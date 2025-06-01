import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import ResumePreview from './pages/ResumePreview';
import CoverLetter from './pages/CoverLetter';
import TemplateGallery from './pages/TemplateGallery';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/resume-preview" element={<ResumePreview />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/template-gallery" element={<TemplateGallery />} />
      </Routes>
    </Router>
  );
}

export default App; 