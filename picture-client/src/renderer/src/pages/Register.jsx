import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/index.css";
import BASE_URL from "../config/config";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/gallery');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.full_name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    form.append("full_name", formData.full_name);
    form.append("email", formData.email);
    form.append("password", formData.password);

    try {
      const response = await axios.post(`${BASE_URL}/v0.1/guest/register`, form);
      if (response.data.success) {
        console.log("Registration successful:", response.data);
        setIsLoading(false);
        navigate("/login");
      } else {
        console.error("Registration failed:", response.data.message);
        setError(response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Server error. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="login-outer-container">
      <div className="login-container">
        <div className="login-area">
          <h3>REGISTER TO Photo Editor</h3>
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form
            id="register-form"
            className="login-items"
            onSubmit={handleSubmit}
          >
            <label htmlFor="fullname">Name</label>
            <input
              type="text"
              className="login"
              name="full_name"
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="login"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="login"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input 
              type="submit" 
              className="login-btn" 
              value={isLoading ? "Registering..." : "Register"} 
              disabled={isLoading}
            />
          </form>
          <p className="reg">
            Already have an account?
            <Link className="a" to="/login">
              Please Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;