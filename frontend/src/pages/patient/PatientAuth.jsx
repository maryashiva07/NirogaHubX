import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";

import "./PatientAuth.css";

const PatientAuth = () => {
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
          role: "patient",
        });

        navigate("/patient/PatientDashboard");
      } else {
        await authService.signup({
          name: formData.name,
          mobile: formData.mobile,
          password: formData.password,
          role: "patient",
        });

        // After signup, go to login
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
    <main className="patient-auth-page">
      <div className="patient-auth-card">
        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-heart">♥</div>

          <h1>NirogaHub</h1>

          <p>Better Health. Closer to You.</p>
        </div>

        {/* HEADING */}
        <div className="auth-heading">
          <h2>{isLogin ? "Welcome Back!" : "Create Patient Account"}</h2>

          <p>
            {isLogin
              ? "Login to continue your healthcare journey"
              : "Create your account and manage your healthcare easily"}
          </p>
        </div>

        {/* ERROR */}
        {error && <div className="auth-error">{error}</div>}

        {/* FORM */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="patient-name">Full Name</label>

              <input
                id="patient-name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="patient-mobile">Mobile Number</label>

            <input
              id="patient-mobile"
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              maxLength="15"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patient-password">Password</label>

            <input
              id="patient-password"
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
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login as Patient"
                : "Create Patient Account"}
          </button>
        </form>

        {/* SWITCH */}
        <div className="auth-switch">
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
          className="back-role-button"
          onClick={() => navigate("/")}
        >
          ← Back to role selection
        </button>
      </div>
    </main>
  );
};

export default PatientAuth;
