import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import doctorService from "../../services/doctorService";

import doctorImage from "../../assets/images/doctor.jpeg";

import "./DoctorProfile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await doctorService.getDoctorById(doctorId);

        setDoctor(response?.doctor || null);
      } catch (err) {
        console.error("Doctor profile error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load doctor profile",
        );
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  const getImageUrl = (image) => {
    if (!image) return doctorImage;

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_BASE_URL}${image}`;
  };

  const handleGenerateToken = () => {
    navigate(`/patient/token/${doctor.id}`);
  };

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-loading">
          <div className="doctor-profile-spinner"></div>
          <p>Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-error">
          <div className="doctor-error-icon">!</div>

          <h2>Doctor Not Found</h2>

          <p>{error || "Doctor profile could not be loaded."}</p>

          <button
            type="button"
            className="doctor-back-button"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const user = doctor.User || doctor.user || {};

  const name = user.name || "Doctor";

  const specialization = doctor.specialization || "Medical Specialist";

  const experience =
    doctor.experience !== null && doctor.experience !== undefined
      ? `${doctor.experience} Years`
      : "Experience not available";

  const clinicName = doctor.clinicName || "Clinic details not available";

  const address = doctor.address || "Address not available";

  const consultationFee =
    doctor.consultationFee !== null && doctor.consultationFee !== undefined
      ? `₹${doctor.consultationFee}`
      : "₹10";

  const image = getImageUrl(doctor.profileImage || user.photo);

  return (
    <div className="doctor-profile-page">
      <header className="doctor-profile-header">
        <button
          type="button"
          className="doctor-profile-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>

        <h1>Doctor Profile</h1>

        <div className="doctor-header-space"></div>
      </header>

      <main className="doctor-profile-container">
        <section className="doctor-profile-hero">
          <div className="doctor-profile-image-wrapper">
            <img
              src={image}
              alt={name}
              className="doctor-profile-image"
              onError={(event) => {
                event.currentTarget.src = doctorImage;
              }}
            />

            <span className="doctor-verified-badge">✓</span>
          </div>

          <div className="doctor-profile-main-info">
            <h2>{name}</h2>

            <p className="doctor-specialization">{specialization}</p>

            <div className="doctor-profile-meta">
              <span>🎓 {experience}</span>

              <span>💰 {consultationFee}</span>
            </div>
          </div>
        </section>

        <section className="doctor-info-card">
          <h3>About Doctor</h3>

          <div className="doctor-info-grid">
            <div className="doctor-info-item">
              <span className="doctor-info-icon">🩺</span>

              <div>
                <small>Specialization</small>
                <strong>{specialization}</strong>
              </div>
            </div>

            <div className="doctor-info-item">
              <span className="doctor-info-icon">🎓</span>

              <div>
                <small>Experience</small>
                <strong>{experience}</strong>
              </div>
            </div>

            <div className="doctor-info-item">
              <span className="doctor-info-icon">🏥</span>

              <div>
                <small>Clinic</small>
                <strong>{clinicName}</strong>
              </div>
            </div>

            <div className="doctor-info-item">
              <span className="doctor-info-icon">📍</span>

              <div>
                <small>Address</small>
                <strong>{address}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="doctor-consultation-card">
          <div>
            <span className="consultation-label">Consultation Fee</span>

            <strong className="consultation-price">{consultationFee}</strong>
          </div>

          <span className="consultation-note">Online token booking</span>
        </section>

        <section className="doctor-token-section">
          <button
            type="button"
            className="doctor-generate-token-button"
            onClick={handleGenerateToken}
          >
            Generate Token
          </button>

          <p>
            Generate your token and complete the payment to book your
            consultation.
          </p>
        </section>
      </main>
    </div>
  );
};

export default DoctorProfile;
