import React from 'react';
import { Link } from 'react-router-dom';

// Simulated logged-in user object (for demo/testing purposes)
// In a real application, this should come from authentication context or API
const user = {
  name: 'Sukhmanpreet Singh',
  email: 'Sukhman29spsg@gmail.com' // This is considered the admin email
};

export default function Dashboard() {
  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>

      {/* Navigation Buttons */}
      <div className="d-flex flex-column gap-2">
        {/* Link to the resume editor */}
        <Link to="/editor" className="btn btn-outline-primary">Create Resume</Link>

        {/* Link to view saved resumes */}
        <Link to="/MyResumes" className="btn btn-outline-success">View Resume</Link>

        {/* Link to browse and select templates */}
        <Link to="/templates" className="btn btn-outline-info">Manage Templates</Link>

        {/* Conditionally show Admin Panel only for the admin email */}
        {user.email === 'Sukhman29spsg@gmail.com' && (
          <Link to="/admin" className="btn btn-outline-secondary">Admin Panel</Link>
        )}
      </div>
    </div>
  );
}
