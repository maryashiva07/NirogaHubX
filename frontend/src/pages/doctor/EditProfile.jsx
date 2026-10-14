import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import doctorImage from "../../assets/images/doctor.jpeg";

import "./EditProfile.css";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const formatDayName = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const createEmptyDays = () => {
  return {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  };
};

const EditProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctorId, setDoctorId] = useState(null);
  const [clinicId, setClinicId] = useState(null);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(doctorImage);

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    consultationFee: "",

    availableSlots: createEmptyDays(),

    clinicName: "",
    address: "",
    location: "",
    clinicPhone: "",

    timings: createEmptyDays(),
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  useEffect(() => {
    loadProfile();
  }, []);

  // Convert backend available slots → form values

  const convertAvailableSlotsToForm = (slots) => {
    const result = createEmptyDays();

    DAYS.forEach((day) => {
      const value = slots?.[day];

      if (Array.isArray(value)) {
        result[day] = value.join(", ");
      } else {
        result[day] = value || "";
      }
    });

    return result;
  };

  // Convert backend clinic timings → form values

  const convertTimingsToForm = (timings) => {
    const result = createEmptyDays();

    DAYS.forEach((day) => {
      result[day] = timings?.[day] || "";
    });

    return result;
  };

  // Convert form slots → backend JSON

  const convertFormToAvailableSlots = (slots) => {
    const result = {};

    DAYS.forEach((day) => {
      const rawValue = slots?.[day];

      if (rawValue === null || rawValue === undefined) {
        return;
      }

      let value = "";

      if (typeof rawValue === "string") {
        value = rawValue.trim();
      } else if (Array.isArray(rawValue)) {
        value = rawValue
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(", ");
      } else {
        value = String(rawValue).trim();
      }

      if (!value) {
        return;
      }

      result[day] = value
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean);
    });

    return result;
  };

  // Convert form timings → backend JSON

  const convertFormToTimings = (timings) => {
    const result = {};

    DAYS.forEach((day) => {
      const rawValue = timings?.[day];

      if (rawValue === null || rawValue === undefined) {
        return;
      }

      let value = "";

      if (typeof rawValue === "string") {
        value = rawValue.trim();
      } else if (Array.isArray(rawValue)) {
        value = rawValue
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(" - ");
      } else if (typeof rawValue === "object") {
        // Handles old/object-based timing data safely
        const start = rawValue.start || rawValue.startTime || "";

        const end = rawValue.end || rawValue.endTime || "";

        if (start && end) {
          value = `${start} - ${end}`;
        } else {
          value = "";
        }
      } else {
        value = String(rawValue).trim();
      }

      if (value) {
        result[day] = value;
      }
    });

    return result;
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get doctor profile
      const doctorResponse = await api.get("/doctors/profile");

      const doctor = doctorResponse?.data?.doctor;

      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      setDoctorId(doctor.id);

      setFormData((previous) => ({
        ...previous,

        specialization: doctor.specialization || "",

        experience: doctor.experience ?? "",

        consultationFee: doctor.consultationFee ?? "",

        // Convert backend JSON into readable form
        availableSlots: convertAvailableSlotsToForm(doctor.availableSlots),
      }));

      const userPhoto = doctor?.User?.photo || doctor?.user?.photo || null;

      if (userPhoto) {
        setPhotoPreview(
          userPhoto.startsWith("http")
            ? userPhoto
            : `${API_BASE_URL}${userPhoto}`,
        );
      }

      // Get clinic separately

      try {
        const clinicResponse = await api.get("/clinics/my");

        const clinic = clinicResponse?.data?.clinic;

        if (clinic) {
          setClinicId(clinic.id);

          setFormData((previous) => ({
            ...previous,

            clinicName: clinic.name || "",

            address: clinic.address || "",

            location: clinic.location || "",

            clinicPhone: clinic.phone || "",

            // Convert backend JSON into readable form
            timings: convertTimingsToForm(clinic.timings),
          }));
        }
      } catch (clinicError) {
        // 404 means doctor does not have a clinic yet
        if (clinicError.response?.status !== 404) {
          console.error("Clinic loading error:", clinicError);
        }

        setClinicId(null);
      }
    } catch (error) {
      console.error("Profile loading error:", error);

      alert(error.response?.data?.message || "Unable to load doctor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Allow only image files
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image");
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB");
      return;
    }

    setSelectedPhoto(file);

    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    // Basic validation

    if (!formData.specialization.trim()) {
      alert("Please enter specialization");
      return;
    }

    if (formData.experience === "" || Number(formData.experience) < 0) {
      alert("Please enter valid experience");
      return;
    }

    if (!formData.clinicName.trim()) {
      alert("Please enter clinic name");
      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter clinic address");
      return;
    }

    try {
      setSaving(true);

      // Convert normal form values → backend JSON

      const availableSlots = convertFormToAvailableSlots(
        formData.availableSlots,
      );

      const timings = convertFormToTimings(formData.timings);

      // 1. Update doctor information

      await api.put("/doctors/profile", {
        specialization: formData.specialization.trim(),

        experience:
          formData.experience === "" ? null : Number(formData.experience),

        consultationFee:
          formData.consultationFee === ""
            ? null
            : Number(formData.consultationFee),

        availableSlots,

        // Keep these fields in doctor table
        clinicName: formData.clinicName.trim(),

        address: formData.address.trim(),
      });

      // 2. Create or update clinic

      const clinicPayload = {
        name: formData.clinicName.trim(),

        address: formData.address.trim(),

        location: formData.location.trim() || null,

        phone: formData.clinicPhone.trim() || null,

        timings,
      };

      if (clinicId) {
        // Existing clinic
        await api.put(`/clinics/${clinicId}`, clinicPayload);
      } else {
        // First clinic creation
        const clinicResponse = await api.post("/clinics", clinicPayload);

        const createdClinic = clinicResponse?.data?.clinic;

        if (createdClinic?.id) {
          setClinicId(createdClinic.id);
        }
      }

      // 3. Upload new doctor photo

      if (selectedPhoto) {
        const photoData = new FormData();

        photoData.append("photo", selectedPhoto);

        await api.put("/doctors/photo", photoData);
      }

      alert("Profile updated successfully");

      navigate("/doctor/profile");
    } catch (error) {
      console.error("Profile update error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-loading">Loading profile...</div>;
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        {/* Header */}

        <div className="edit-profile-header">
          <div>
            <h1>Edit Doctor Profile</h1>

            <p>Update your professional and clinic information</p>
          </div>

          <button
            type="button"
            className="back-profile-button"
            onClick={() => navigate("/doctor/profile")}
          >
            Back
          </button>
        </div>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <section className="edit-profile-section photo-section">
            <h2>Profile Photo</h2>

            <div className="doctor-photo-editor">
              <img
                src={photoPreview}
                alt="Doctor"
                className="doctor-edit-photo"
              />

              <div className="photo-upload-content">
                <h3>Doctor Profile Photo</h3>

                <p>JPG, JPEG, PNG or WEBP. Maximum size 5 MB.</p>

                <label htmlFor="doctor-photo" className="photo-upload-button">
                  Choose Photo
                </label>

                <input
                  id="doctor-photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />

                {selectedPhoto && (
                  <span className="selected-photo-name">
                    {selectedPhoto.name}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="edit-profile-section">
            <h2>Professional Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Specialization</label>

                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiologist"
                />
              </div>

              <div className="form-group">
                <label>Experience</label>

                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Consultation Fee</label>

                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="₹ Consultation fee"
                  min="0"
                />
              </div>
            </div>
          </section>

          <section className="edit-profile-section">
            <h2>Clinic Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Clinic Name</label>

                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  placeholder="Enter clinic name"
                />
              </div>

              <div className="form-group">
                <label>Clinic Phone</label>

                <input
                  type="text"
                  name="clinicPhone"
                  value={formData.clinicPhone}
                  onChange={handleChange}
                  placeholder="Clinic phone number"
                />
              </div>

              <div className="form-group full-width">
                <label>Clinic Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete clinic address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Rewa, MP"
                />
              </div>
            </div>
          </section>

          <section className="edit-profile-section">
            <h2>Availability</h2>

            <p className="section-description">
              Enter the appointment slots available on each day. Separate
              multiple slots with commas.
            </p>

            <div className="day-form-grid">
              {DAYS.map((day) => (
                <div className="form-group" key={day}>
                  <label>{formatDayName(day)}</label>

                  <input
                    type="text"
                    value={formData.availableSlots[day]}
                    onChange={(event) => {
                      const value = event.target.value;

                      setFormData((previous) => ({
                        ...previous,

                        availableSlots: {
                          ...previous.availableSlots,

                          [day]: value,
                        },
                      }));
                    }}
                    placeholder="e.g. 10:00 AM, 10:30 AM, 11:00 AM"
                  />
                </div>
              ))}
            </div>

            <small className="form-help-text">
              Example: 10:00 AM, 10:30 AM, 11:00 AM
            </small>
          </section>

          <section className="edit-profile-section">
            <h2>Clinic Timings</h2>

            <p className="section-description">
              Enter the opening and closing time of your clinic for each day.
            </p>

            <div className="day-form-grid">
              {DAYS.map((day) => (
                <div className="form-group" key={day}>
                  <label>{formatDayName(day)}</label>

                  <input
                    type="text"
                    value={formData.timings[day]}
                    onChange={(event) => {
                      const value = event.target.value;

                      setFormData((previous) => ({
                        ...previous,

                        timings: {
                          ...previous.timings,

                          [day]: value,
                        },
                      }));
                    }}
                    placeholder="e.g. 10:00 AM - 6:00 PM"
                  />
                </div>
              ))}
            </div>

            <small className="form-help-text">
              Example: 10:00 AM - 6:00 PM
            </small>
          </section>

          <div className="edit-profile-actions">
            <button
              type="button"
              className="cancel-profile-button"
              onClick={() => navigate("/doctor/profile")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-profile-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
