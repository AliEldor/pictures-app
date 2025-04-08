import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config/config";

const Register = () => {

    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.full_name || !formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }

      const form = new FormData();
    form.append("full_name", formData.full_name);
    form.append("email", formData.email);
    form.append("password", formData.password);

    try {
        const response = await axios.post(`${BASE_URL}/v0.1/guest/signup`, form);
        if (response.data.success) {
          console.log("Registration successful:", response.data);
          navigate("/");
        } else {
          console.error("Registration failed:", response.data.message);
          setError(response.data.message);
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
      }
    };


  return (
    <div className="login-outer-container">
      <div className="login-container">
        <div className="login-area">
          <h3>REGISTER TO Gallery</h3>
          {error && <div className="error-message">{error}</div>}
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
            />
            <input type="submit" className="login-btn" value="Register" />
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
  )
}

export default Register
