import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Login() {
  // State to hold form input values
  const [data, setData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  // Update state when input fields change
  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    try {
      // Send login request to backend
      const res = await api.post('api/auth/login', data);

      // Store the returned token in localStorage
      localStorage.setItem('token', res.data.token);

      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch {
      // Show alert on login failure
      alert("Login failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <input
          className="form-control mb-2"
          name="email"
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
        <button className="btn btn-success">Login</button>

        {/* Link to Signup */}
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}
