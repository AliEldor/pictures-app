import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/index.css";
import BASE_URL from "../config/config";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState('');
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

  // Get location data from ipapi
  const getLocationData = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Location data retrieved:', data);
      
      return {
        ip_address: data.ip,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Fallback func
      return {
        ip_address: '127.0.0.1',
        latitude: 0,
        longitude: 0
      };
    }
  };

  const saveLoginHistory = async (userId, token) => {
    try {
      // Get real location data
      const locationData = await getLocationData();
    
      const formDataObj = new FormData();
      formDataObj.append('user_id', userId);
      formDataObj.append('ip_address', locationData.ip_address);
      formDataObj.append('latitude', locationData.latitude.toString());
      formDataObj.append('longitude', locationData.longitude.toString());
      
      console.log('Sending login history data:', {
        user_id: userId,
        ip_address: locationData.ip_address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });
      
      // Send to backend
      const historyResponse = await axios.post(
        `${BASE_URL}/v0.1/user/login-history`, 
        formDataObj,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Login history saved successfully:', historyResponse.data);
      return true;
    } catch (error) {
      console.error('Failed to save login history:', error.response?.data || error);
      return false;
    }
  };
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);

    try {
        const response = await axios.post(`${BASE_URL}/v0.1/guest/login`, form);
        console.log("Login attempt:", response.data);
        
        if (response.data.success) {
          console.log("Login successful:", response.data);

          const userId = response.data.user.id;
          const userName = response.data.user.full_name;
          const token = response.data.token;

          // Store user data in localStorage
          localStorage.setItem('userId', userId);
          localStorage.setItem('userName', userName);
          localStorage.setItem('token', token);

          try {
            await saveLoginHistory(userId, token);
          } catch (historyError) {
            console.log("Login was successful but login history could not be saved");
          }
          
          setIsLoading(false);
          navigate('/gallery');
        }
        else {
          console.log("Login failed:", response.data.message);
          setError(response.data.message || 'Login failed');
          setIsLoading(false);
        }
    }
    catch(error) {
        console.error('Login error:', error);
        setError('Server error. Please try again later.');
        setIsLoading(false);
    }
  }

  return(
    <div className='login-outer-container'>
      <div className='login-container'>
        <div className='login-area'>
          <h3>LOGIN TO Photo Editor</h3>
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form id="login-form" className='login-items' onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              className='login' 
              name="email" 
              placeholder='Enter your email' 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={isLoading}
            />
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              className='login' 
              name="password" 
              placeholder="Enter Your Password" 
              value={formData.password}
              onChange={handleChange}
              required 
              disabled={isLoading}
            />
            <input 
              type="submit" 
              className='login-btn' 
              value={isLoading ? "Logging in..." : "Login"} 
              disabled={isLoading}
            />
          </form>
          <p className='reg'>
            New to Photo Editor? <Link className='a' to="/register">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;