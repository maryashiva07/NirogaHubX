import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import doctorImage from "../../assets/images/doctor.jpeg";

import "./DoctorProfile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const DoctorProfile = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      const response = await api.get("/doctors/profile");

      const doctorData = response?.data?.doctor;

      setDoctor(doctorData || null);
    } catch (error) {
      console.error("Doctor profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorPhoto = () => {
    const photo =
      doctor?.User?.photo || doctor?.user?.photo || doctor?.profileImage;

    if (!photo) {
      return doctorImage;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  };

  if (loading) {
    return <div className="doctor-profile-loading">Loading profile...</div>;
  }

  if (!doctor) {
    return (
      <div className="doctor-profile-loading">Doctor profile not found.</div>
    );
  }

  const user = doctor.User || doctor.user || {};

  return (
    <div className="doctor-profile-page">
      <header className="doctor-profile-header">
        <button
          type="button"
          className="doctor-profile-back-button"
          onClick={() => navigate("/doctor/dashboard")}
        >
          ←
        </button>

        <h1>My Profile</h1>

        <button
          type="button"
          className="doctor-profile-edit-button"
          onClick={() => navigate("/doctor/profile/edit")}
        >
          Edit
        </button>
      </header>

      <main className="doctor-profile-content">
        <section className="doctor-profile-card">
          <div className="doctor-profile-photo-wrapper">
            <img
              src={getDoctorPhoto()}
              alt={user.name || "Doctor"}
              className="doctor-profile-photo"
              onError={(event) => {
                event.currentTarget.src = doctorImage;
              }}
            />
          </div>

          <h2>Dr. {user.name || "Doctor"}</h2>

          <p className="doctor-profile-mobile">
            {user.mobile || "Mobile number not available"}
          </p>
        </section>

        <section className="doctor-profile-section">
          <div className="doctor-profile-section-title">
            <h2>Professional Information</h2>
          </div>

          <div className="doctor-profile-info-grid">
            <div className="doctor-profile-info-item">
              <span>Specialization</span>
              <strong>{doctor.specialization || "Not added yet"}</strong>
            </div>

            <div className="doctor-profile-info-item">
              <span>Experience</span>
              <strong>
                {doctor.experience !== null &&
                doctor.experience !== undefined &&
                doctor.experience !== ""
                  ? `${doctor.experience} years`
                  : "Not added yet"}
              </strong>
            </div>

            <div className="doctor-profile-info-item">
              <span>Consultation Fee</span>
              <strong>
                {doctor.consultationFee !== null &&
                doctor.consultationFee !== undefined
                  ? `₹${doctor.consultationFee}`
                  : "Not added yet"}
              </strong>
            </div>

            <div className="doctor-profile-info-item">
              <span>Profile Status</span>
              <strong
                className={`doctor-profile-status ${
                  doctor.status || "pending"
                }`}
              >
                {doctor.status || "Pending"}
              </strong>
            </div>
          </div>
        </section>

        <section className="doctor-profile-section">
          <div className="doctor-profile-section-title">
            <h2>Clinic Information</h2>
          </div>

          <div className="doctor-clinic-card">
            <div className="doctor-clinic-icon">🏥</div>

            <div className="doctor-clinic-details">
              <h3>{doctor.clinicName || "Clinic not added yet"}</h3>

              <p>{doctor.address || "Clinic address not added yet"}</p>
            </div>
          </div>
        </section>

        <section className="doctor-profile-section">
          <div className="doctor-profile-section-title">
            <h2>Availability</h2>
          </div>

          {doctor.availableSlots ? (
            <div className="doctor-availability-card">
              <pre>
                {typeof doctor.availableSlots === "string"
                  ? doctor.availableSlots
                  : JSON.stringify(doctor.availableSlots, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="doctor-empty-card">
              <span>🕐</span>
              <p>Availability has not been added yet.</p>
            </div>
          )}
        </section>

        <button
          type="button"
          className="doctor-profile-main-edit"
          onClick={() => navigate("/doctor/profile/edit")}
        >
          Edit Profile
        </button>

        <button
          type="button"
          className="doctor-profile-dashboard-button"
          onClick={() => navigate("/doctor/dashboard")}
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
};

export default DoctorProfile;
