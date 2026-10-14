import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import patientService from "../../services/patientService";
import patientImage from "../../assets/images/patient.png";

import "./PatientEditProfile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientEditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    emergencyContact: "",
  });

  const [photo, setPhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await patientService.getProfile();

      if (response.success) {
        const patient = response.patient;

        setFormData({
          name: patient?.User?.name || "",
          age: patient?.age || "",
          gender: patient?.gender || "",
          address: patient?.address || "",
          emergencyContact: patient?.emergencyContact || "",
        });

        setPhoto(patient?.User?.photo || "");
      }
    } catch (error) {
      console.error("Failed to load patient profile:", error);

      setError(error.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return patientImage;
    }

    if (photo.startsWith("blob:") || photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");

      e.target.value = "";
      setSelectedPhoto(null);

      return;
    }

    // Allowed image types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG and WEBP images are allowed.");

      e.target.value = "";
      setSelectedPhoto(null);

      return;
    }

    // Store actual File object
    setSelectedPhoto(file);

    // Create temporary preview
    const previewUrl = URL.createObjectURL(file);

    setPhoto(previewUrl);

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await patientService.updateProfile({
        name: formData.name.trim(),

        age: formData.age ? Number(formData.age) : null,

        gender: formData.gender || null,

        address: formData.address.trim(),

        emergencyContact: formData.emergencyContact.trim(),
      });

      if (!response.success) {
        setError(response.message || "Unable to update profile.");

        return;
      }

      if (selectedPhoto) {
        console.log("Uploading photo:", selectedPhoto);

        const photoResponse = await patientService.updatePhoto(selectedPhoto);

        console.log("Photo upload response:", photoResponse);

        if (!photoResponse.success) {
          setError(
            photoResponse.message ||
              "Profile updated, but photo upload failed.",
          );

          return;
        }
      }

      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        navigate("/patient/profile");
      }, 800);
    } catch (error) {
      console.error("Failed to update profile:", error);

      setError(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="patient-edit-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>

          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="patient-edit-profile-page">
      {/* Header */}

      <header className="edit-profile-header">
        <button
          type="button"
          className="edit-back-button"
          onClick={() => navigate("/patient/profile")}
        >
          ←
        </button>

        <h1>Edit Profile</h1>

        <div className="edit-header-space"></div>
      </header>

      {/* Content */}

      <section className="edit-profile-content">
        {/* Error */}

        {error && <div className="edit-profile-error">{error}</div>}

        {/* Success */}

        {success && <div className="edit-profile-success">{success}</div>}

        {/* Form */}

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          {/* Photo */}

          <div className="edit-photo-section">
            <div className="edit-profile-avatar">
              <img
                src={getPhotoUrl(photo)}
                alt="Patient"
                onError={(e) => {
                  e.currentTarget.src = patientImage;
                }}
              />
            </div>

            <label htmlFor="patient-photo" className="change-photo-button">
              Change Photo
            </label>

            <input
              id="patient-photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              hidden
            />

            <small className="photo-help-text">
              JPG, PNG or WEBP • Maximum 5 MB
            </small>
          </div>

          {/* Full Name */}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Age */}

          <div className="form-group">
            <label htmlFor="age">Age</label>

            <input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
            />
          </div>

          {/* Gender */}

          <div className="form-group">
            <label htmlFor="gender">Gender</label>

            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>

              <option value="male">Male</option>

              <option value="female">Female</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* Address */}

          <div className="form-group">
            <label htmlFor="address">Address</label>

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="3"
            />
          </div>

          {/* Emergency Contact */}

          <div className="form-group">
            <label htmlFor="emergencyContact">Emergency Contact</label>

            <input
              id="emergencyContact"
              name="emergencyContact"
              type="tel"
              maxLength="15"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Enter emergency contact"
            />
          </div>

          {/* Mobile */}

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>

            <input
              id="mobile"
              type="text"
              value="Registered mobile number"
              disabled
            />

            <small>Mobile number cannot be changed here.</small>
          </div>

          {/* Save */}

          <button
            type="submit"
            className="save-profile-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default PatientEditProfile;
