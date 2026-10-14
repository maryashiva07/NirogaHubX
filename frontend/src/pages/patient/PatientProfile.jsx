import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import patientService from "../../services/patientService";

import patientImage from "../../assets/images/patient.png";

import "./PatientProfile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientProfile = () => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await patientService.getProfile();

      if (response.success) {
        setPatient(response.patient);
      }
    } catch (error) {
      console.error("Failed to load patient profile:", error);

      try {
        const response = await authService.getMe();

        if (response.success) {
          setPatient(response.user);
        }
      } catch (authError) {
        console.error("Failed to load user:", authError);

        if (authError.response?.status === 401) {
          authService.logout();
          navigate("/patient");
          return;
        }

        setError(
          authError.response?.data?.message || "Unable to load profile.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    // No photo
    if (!photo) {
      return patientImage;
    }

    // Already complete URL
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    // Local preview URL
    if (photo.startsWith("blob:")) {
      return photo;
    }

    // Backend relative path
    return `${API_BASE_URL}${photo}`;
  };

  const handleLogout = () => {
    authService.logout();

    navigate("/patient");
  };

  if (loading) {
    return (
      <main className="patient-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>

          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  const user = patient?.User || patient;

  const profilePhoto = user?.photo || "";

  const userName = user?.name || "Patient";

  const userMobile = user?.mobile || "Not available";

  const userRole = user?.role || "patient";

  return (
    <main className="patient-profile-page">
      <header className="profile-header">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/patient/dashboard")}
        >
          ←
        </button>

        <h1>My Profile</h1>

        <div className="profile-header-space"></div>
      </header>

      <section className="profile-content">
        {/* Error */}

        {error && <div className="profile-error">{error}</div>}

        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img
              src={getPhotoUrl(profilePhoto)}
              alt={userName}
              onError={(e) => {
                console.error(
                  "Profile image failed to load:",
                  getPhotoUrl(profilePhoto),
                );

                e.currentTarget.src = patientImage;
              }}
            />
          </div>

          <h2>{userName}</h2>

          <p>{userRole === "patient" ? "Patient" : ""}</p>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Personal Information</h3>
          </div>

          {/* Full Name */}

          <div className="profile-field">
            <span className="profile-label">Full Name</span>

            <span className="profile-value">{userName}</span>
          </div>

          {/* Mobile */}

          <div className="profile-field">
            <span className="profile-label">Mobile Number</span>

            <span className="profile-value">{userMobile}</span>
          </div>

          {/* Account Type */}

          <div className="profile-field">
            <span className="profile-label">Account Type</span>

            <span className="profile-value">Patient</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-action-button"
            onClick={() => navigate("/patient/edit-profile")}
          >
            <span>✏️</span>
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            className="profile-action-button logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </section>

      <nav className="patient-bottom-nav">
        <button
          type="button"
          className="bottom-nav-item"
          onClick={() => navigate("/patient/dashboard")}
        >
          <span className="bottom-icon">🏠</span>

          <span>Home</span>
        </button>

        <button
          type="button"
          className="bottom-nav-item"
          onClick={() => navigate("/patient/clinics")}
        >
          <span className="bottom-icon">🏥</span>

          <span>Clinics</span>
        </button>

        <button
          type="button"
          className="bottom-nav-item active"
          onClick={() => navigate("/patient/profile")}
        >
          <span className="bottom-icon">●</span>

          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
};

export default PatientProfile;
