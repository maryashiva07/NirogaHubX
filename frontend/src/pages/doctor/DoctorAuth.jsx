import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";

import "./DoctorAuth.css";

const DoctorAuth = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login({
          mobile: formData.mobile,
          password: formData.password,
          role: "doctor",
        });

        navigate("/doctor/dashboard");
      } else {
        await authService.signup({
          name: formData.name,
          mobile: formData.mobile,
          password: formData.password,
          role: "doctor",
        });

        setIsLogin(true);

        setFormData({
          name: "",
          mobile: formData.mobile,
          password: "",
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="doctor-auth-page">
      <div className="doctor-auth-card">
        {/* BRAND */}
        <div className="doctor-auth-brand">
          <div className="doctor-auth-icon">♥</div>

          <h1>NirogaHub</h1>

          <p>Better Health. Closer to You.</p>
        </div>

        {/* HEADING */}
        <div className="doctor-auth-heading">
          <h2>{isLogin ? "Welcome Back, Doctor!" : "Create Doctor Account"}</h2>

          <p>
            {isLogin
              ? "Login to manage your patients and appointments"
              : "Join NirogaHub and manage your patients digitally"}
          </p>
        </div>

        {/* ERROR */}
        {error && <div className="doctor-auth-error">{error}</div>}

        {/* FORM */}
        <form className="doctor-auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="doctor-form-group">
              <label htmlFor="doctor-name">Full Name</label>

              <input
                id="doctor-name"
                type="text"
                name="name"
                placeholder="Dr. Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="doctor-form-group">
            <label htmlFor="doctor-mobile">Mobile Number</label>

            <input
              id="doctor-mobile"
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              maxLength="15"
              required
            />
          </div>

          <div className="doctor-form-group">
            <label htmlFor="doctor-password">Password</label>

            <input
              id="doctor-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="doctor-auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login as Doctor"
                : "Create Doctor Account"}
          </button>
        </form>

        {/* SWITCH */}
        <div className="doctor-auth-switch">
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsLogin((prev) => !prev);
              setError("");
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>

        {/* BACK */}
        <button
          type="button"
          className="doctor-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to role selection
        </button>
      </div>
    </main>
  );
};

export default DoctorAuth;
