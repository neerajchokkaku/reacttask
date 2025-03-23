import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Reuse the same styles

const Register = () => {
  const [name, setName] = useState('');
  const [batch, setbatch] = useState('');
  const [department, setdepartment] = useState('');


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log("Registering user:", { name,batch,department, email, password, userType });

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        batch,
        department,
        email,
        password,
        userType
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required  
            />
            
            <label>Batch</label>
            <input
              type="number"
              value={batch}
              onChange={(e) => setbatch(e.target.value)}
              required  
            />
             <label>department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setdepartment(e.target.value)}
              required  
            />
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>User Type</label>
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="official">Official</option>
            </select>
          </div>
          
          <button type="submit" className="login-button">Register</button>
        </form>
        
        <div className="register-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
