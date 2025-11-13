import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import axios from "axios";
import BulbToggle from '../../components/ThemeToggle/BulbToggle';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.error');
        if (firstErrorElement) {
          const formGroup = firstErrorElement.closest('.form-group');
          const targetElement = formGroup || firstErrorElement;
          const elementRect = targetElement.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const middle = absoluteElementTop - (window.innerHeight / 2) + 100;

          window.scrollTo({ top: Math.max(0, middle), behavior: "smooth" });

          const relatedInput = formGroup?.querySelector('.animated-input');
          if (relatedInput) setTimeout(() => relatedInput.focus(), 500);
        } else if (errors.general) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  }, [errors]);

  // Google login removed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters long";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters long";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });

      // Save token, role, username, and user_id in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("user_id", res.data.user_id); // <-- added

      setShowSuccess(true);

      const authBox = document.querySelector('.auth-box');
      if (authBox) authBox.classList.add('success-animation');

      setTimeout(() => {
        const role = res.data.role;
        if (role === "admin") navigate("/admin/analytics/dashboard");
        else if (role === "user") navigate("/user/home/dashboard");
        else if (role === "owner") navigate("/owner/management/dashboard");
        else navigate("/");
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      if (err.response?.status === 401) setErrors({ general: "Invalid username or password" });
      else if (err.response?.status === 404) setErrors({ username: "User not found" });
      else if (err.response?.status === 400) setErrors({ general: err.response.data.message || "Please check your credentials" });
      else setErrors({ general: "Login failed. Please try again later." });

      if (errors.general) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
      <div className="auth-container">
        <BulbToggle />
        <div className="auth-wrapper">
          <div className={`auth-box ${showSuccess ? 'success-animation' : ''}`}>
            <div className="auth-header auth-header--stack">
              <h1 className="title-center"><span className="title-gradient">Welcome Back</span></h1>
              {!showSuccess && <p className="subtitle">Login to your Evenza account</p>}
              {showSuccess && (
                <div className="success-message">
                  <span className="success-icon">🎉</span>
                  <p><strong>Login successful.</strong></p>
                  <p>Redirecting to your dashboard...</p>
                </div>
              )}
            </div>

            {errors.general && (
              <div className="error general-error">
                <strong>⚠️ Error:</strong> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} ref={formRef} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label"><span>Username</span><span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className={`animated-input ${errors.username ? 'error-input' : ''}`}
                    autoComplete="username"
                  />
                  <div className="input-icon">👤</div>
                </div>
                {errors.username && <div className="error">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label className="form-label"><span>Password</span><span className="required">*</span></label>
                <div className="input-wrapper">
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`animated-input ${errors.password ? 'error-input' : ''}`}
                    autoComplete="current-password"
                  />
                  <div className="input-icon">🔒</div>
                </div>
                {errors.password && <div className="error">{errors.password}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'right' }}>
                <a href="/forgot-password" className="link-hover-effect" style={{ fontSize: '0.9rem' }}>Forgot your password?</a>
              </div>

              <button 
                type="submit" 
                className={`auth-button ${isSubmitting ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                disabled={isSubmitting || showSuccess}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Loging In...
                  </>
                ) : showSuccess ? (
                  <>
                    <span className="success-check">✓</span>
                    Welcome Back!
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Removed: Create an account link */}
          </div>
        </div>
      </div>
  );
}

export default Login;
