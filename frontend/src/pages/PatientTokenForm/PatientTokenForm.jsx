import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import doctorService from "../../services/doctorService";
import patientService from "../../services/patientService";
import tokenService from "../../services/tokenService";

import doctorImage from "../../assets/images/doctor.jpeg";

import "./PatientTokenForm.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientTokenForm = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientMobile: "",
    patientAddress: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getImageUrl = (photo) => {
    if (!photo) {
      return doctorImage;
    }

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://") ||
      photo.startsWith("blob:")
    ) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [doctorResponse, patientResponse] = await Promise.all([
          doctorService.getDoctorById(doctorId),
          patientService.getProfile(),
        ]);

        setDoctor(doctorResponse.doctor || doctorResponse);

        const patient = patientResponse.patient;

        const user = patient?.User;

        setFormData({
          patientName: user?.name || "",

          patientAge: patient?.age || "",

          patientGender: patient?.gender || "",

          patientMobile: user?.mobile || "",

          patientAddress: patient?.address || "",
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || "Unable to load patient information",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctorId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSubmitting(true);

      const response = await tokenService.createToken({
        doctorId: Number(doctorId),

        patientName: formData.patientName.trim(),

        patientAge: formData.patientAge ? Number(formData.patientAge) : null,

        patientGender: formData.patientGender || null,

        patientMobile: formData.patientMobile.trim(),

        patientAddress: formData.patientAddress.trim(),
      });

      if (!response.success || !response.paymentSessionId) {
        throw new Error("Payment session could not be created");
      }

      if (!window.Cashfree) {
        throw new Error("Cashfree SDK is not loaded");
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: response.paymentSessionId,

        redirectTarget: "_self",
      });
    } catch (err) {
      console.error(err);

      console.error("Create token error:", error);
      console.error("Backend response:", error.response?.data);

      alert(error.response?.data?.message || "Unable to create token");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate token",
      );

      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-token-page">
        <div className="patient-token-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="patient-token-page">
      <div className="patient-token-card">
        <button className="token-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="token-page-header">
          <h1>Patient Information</h1>

          <p>Enter your details to generate your consultation token.</p>
        </div>

        {doctor && (
          <div className="selected-doctor">
            <img
              src={getImageUrl(doctor.profileImage || doctor.User?.photo)}
              alt={doctor.User?.name || "Doctor"}
            />

            <div>
              <h3>Dr. {doctor.User?.name || "Doctor"}</h3>

              <p>{doctor.specialization || "Medical Specialist"}</p>

              {doctor.clinicName && <span>{doctor.clinicName}</span>}
            </div>
          </div>
        )}

        <form className="patient-token-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>

              <input
                type="number"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                placeholder="Age"
                min="1"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select
                name="patientGender"
                value={formData.patientGender}
                onChange={handleChange}
              >
                <option value="">Select</option>

                <option value="male">Male</option>

                <option value="female">Female</option>

                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              name="patientMobile"
              value={formData.patientMobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              maxLength="15"
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="patientAddress"
              value={formData.patientAddress}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="3"
            />
          </div>

          {error && <div className="token-error">{error}</div>}

          <div className="token-payment-box">
            <div>
              <span>Consultation Token</span>

              <strong>₹10</strong>
            </div>

            <small>
              You will be redirected to Cashfree Sandbox for payment.
            </small>
          </div>

          <button
            type="submit"
            className="generate-token-button"
            disabled={submitting}
          >
            {submitting ? "Opening Payment..." : "Generate Token & Pay ₹10"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientTokenForm;
