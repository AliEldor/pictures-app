import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/index.css"
import BASE_URL  from "../config/config"

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit= async(e)=>{
    e.preventDefault();
    setError('');

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);

    try{
        const response = await axios.post(`${BASE_URL}/v0.1/guest/login`, form);
        console.log("Login successful: ",response.data);

        if (response.data.success) {

          console.log("Login successful:", response.data);
            // Store user data in localStorage
            
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('userName', response.data.user.full_name);
            localStorage.setItem('token',response.data.token)
        
        navigate('/snippet');
        }
        else {
          console.log("Login failed:", response.data.message);
          setError(response.data.message);
        }
    }
    catch(error){
        console.error('Login error: ',error)
        setError('Server error. Please try again later.');

    }

  }

  return(
  <div className='login-outer-container'>
      <div className='login-container'>
        <div className='login-area'>
          <h3>LOGIN TO Gallery</h3>
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
            />
            <input 
              type="submit" 
              className='login-btn' 
              value="Login" 
            />
          </form>
          <p className='reg'>
            New to FAQ? <Link className='a' to="/register">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
};

export default Login;