import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  // Form state for user input
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  // Update form state as user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: ensure passwords match
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // Submit form data to the registration endpoint
      const res = await api.post('auth/register', form);
      alert("Registration successful. Please check your email to verify.");
      navigate('/login'); // Redirect to login after successful signup
    } catch (err) {
      // Display specific error message from the server, if available
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Signup failed");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Name field */}
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        {/* Email field */}
        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        {/* Password field */}
        <input
          className="form-control mb-2"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        {/* Confirm Password field */}
        <input
          className="form-control mb-2"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />

        {/* Submit button */}
        <button className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}
