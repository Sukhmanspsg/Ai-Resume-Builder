import React, { useState } from 'react';
import api from '../services/api';

export default function Register() {
  // State to store form input values
  const [data, setData] = useState({ name: '', email: '', password: '' });

  // Update state whenever form fields change
  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Send registration data to backend API
      await api.post('/register', data);
      alert("Registration successful"); // Notify user on success
    } catch (err) {
      alert("Error registering user"); // Notify user on failure
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />

        {/* Email Input */}
        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        {/* Password Input */}
        <input
          className="form-control mb-2"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        {/* Submit Button */}
        <button className="btn btn-primary">Register</button>
      </form>
    </div>
  );
}
