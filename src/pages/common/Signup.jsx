import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import axios from "axios";
import BulbToggle from '../../components/ThemeToggle/BulbToggle';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const scrollTimer = setTimeout(() => {
        const firstErrorElement = document.querySelector('.error');
        if (firstErrorElement) {
          const formGroup = firstErrorElement.closest('.form-group');
          if (formGroup) {
            formGroup.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            const focusTimer = setTimeout(() => {
              const relatedInput = formGroup.querySelector('.animated-input');
              if (relatedInput) {
                relatedInput.focus();
                relatedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 600);
            return () => clearTimeout(focusTimer);
          }
        } else if (errors.general) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [errors]);

  useEffect(() => {
    const handleScroll = () => {
      const internalLinks = document.querySelectorAll('a[href^="#"]');
      internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    };
    setTimeout(handleScroll, 100);
  }, []);

  useEffect(() => {
    const enableScrolling = () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.height = 'auto';
      const authContainer = document.querySelector('.auth-container');
      if (authContainer) {
        authContainer.style.overflow = 'auto';
        authContainer.style.height = 'auto';
        authContainer.style.minHeight = '100vh';
      }
    };
    enableScrolling();
    setTimeout(enableScrolling, 100);
    setTimeout(enableScrolling, 500);
    window.addEventListener('resize', enableScrolling);
    return () => {
      window.removeEventListener('resize', enableScrolling);
    };
  }, []);

  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (password.match(/[a-z]/)) strength += 25;
      if (password.match(/[A-Z]/)) strength += 25;
      if (password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/)) strength += 25;
      return strength;
    };
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  // Google signup removed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => ({
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const validation = validatePassword(formData.password);
      if (!validation.length) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!validation.lowercase || !validation.uppercase || !validation.number) {
        newErrors.password = "Password must contain uppercase, lowercase, and numbers";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role || formData.role === "") {
      newErrors.role = "Please select your role";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setShowSuccess(true);
      const authBox = document.querySelector('.auth-box');
      if (authBox) {
        authBox.classList.add('success-animation');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      setIsSubmitting(false);
      
      console.error("Signup error details:", err);
      
      if (err.response?.status === 409) {
        console.log("🔍 409 Conflict Response:", err.response.data);
        const { conflicts, message } = err.response.data || {};
        console.log("🔍 Parsed conflicts:", conflicts);
        console.log("🔍 Parsed message:", message);
        
        const fieldErrors = {};
        
        // Set specific field errors based on conflicts
        if (conflicts?.username) {
          fieldErrors.username = "Username is already taken";
          console.log("🔍 Setting username error");
        }
        if (conflicts?.email) {
          fieldErrors.email = "Email is already registered";
          console.log("🔍 Setting email error");
        }
        
        console.log("🔍 Final field errors:", fieldErrors);
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          console.log("🔍 Setting field-specific errors");
        } else {
          // Fallback to general error if no specific conflicts
          setErrors({ general: message || "Username or email already exists" });
          console.log("🔍 Setting general error as fallback");
        }
      } else if (err.response?.status === 400) {
        setErrors({ general: err.response.data.message || "Please check your information and try again" });
      } else if (err.response?.status === 500) {
        setErrors({ general: "Server error. Please check if the backend is running." });
      } else if (err.code === 'ERR_NETWORK') {
        setErrors({ general: "Network error. Unable to connect to the server." });
      } else if (err.response?.status === 404) {
        setErrors({ general: "Signup endpoint not found. Please check the backend configuration." });
      } else {
        setErrors({ general: `Server error (${err.response?.status || 'unknown'}). Please try again later.` });
      }
      
      // Smooth scroll to top for errors
      if (errors.general) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#ef4444';
    if (passwordStrength < 50) return '#f59e0b';
    if (passwordStrength < 75) return '#eab308';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <div className="auth-container">
        <BulbToggle />
        <button 
          onClick={scrollToTop}
          className="scroll-top-btn"
          title="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          ↑
        </button>
        <div className="auth-wrapper">
          <div className={`auth-box ${showSuccess ? 'success-animation' : ''}`}>
            <div className="auth-header">
              <h1 className="title-center">
                <span className="title-gradient">Join Evenza</span>
              </h1>
              <p className="subtitle">Create your account and start managing amazing events</p>
            </div>

            {showSuccess && (
              <div className="success-message">
                <span className="success-icon">✨</span>
                <p><strong>Welcome to Evenza!</strong></p>
                <p>Your account has been created successfully. Redirecting to login...</p>
              </div>
            )}

            {errors.general && (
              <div className="error general-error">
                <strong>⚠️ Error:</strong> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} ref={formRef} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label">
                  <span>Username</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a unique username"
                    className={`animated-input ${errors.username ? 'error-input' : ''}`}
                    autoComplete="username"
                    maxLength="30"
                  />
                  <div className="input-icon">👤</div>
                </div>
                {errors.username && <div className="error">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Email Address</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`animated-input ${errors.email ? 'error-input' : ''}`}
                    autoComplete="email"
                  />
                  <div className="input-icon">✉️</div>
                </div>
                {errors.email && <div className="error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Password</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={`animated-input ${errors.password ? 'error-input' : ''}`}
                    autoComplete="new-password"
                    minLength="8"
                  />
                  <div className="input-icon">🔒</div>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                {errors.password && <div className="error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Confirm Password</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`animated-input ${errors.confirmPassword ? 'error-input' : ''}`}
                    autoComplete="new-password"
                  />
                  <div className="input-icon">🔐</div>
                </div>
                {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>I want to</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className={`animated-input ${errors.role ? 'error-input' : ''}`}
                  >
                    <option value="">Choose your role</option>
                    <option value="user">🎫 Attend Events (User)</option>
                    <option value="admin">📋 Manage Events (Admin)</option>
                  </select>
                  <div className="input-icon">🎭</div>
                </div>
                {errors.role && <div className="error">{errors.role}</div>}
              </div>

              <button 
                type="submit" 
                className={`auth-button ${isSubmitting ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                disabled={isSubmitting || showSuccess}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : showSuccess ? (
                  <>
                    <span className="success-check">✓</span>
                    Account Created!
                  </>
                ) : (
                  "Create My Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account? 
                <a href="/login" className="link-hover-effect"> Sign in here</a>
              </p>
              <div className="terms">
                By creating an account, you agree to our 
                <a href="/terms" className="link-hover-effect"> Terms of Service</a> and 
                <a href="/privacy" className="link-hover-effect"> Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Signup;
