import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import patientRecordService from "../../services/patientRecordService";

import patientImage from "../../assets/images/patient.png";

import "./PatientView.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientView = () => {
  const navigate = useNavigate();

  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);

  const [latestVisit, setLatestVisit] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);

        const response =
          await patientRecordService.getPatientDetails(patientId);

        setPatient(response.patient);

        setLatestVisit(response.latestVisit);
      } catch (error) {
        console.error("Patient details error:", error);

        setError(error.response?.data?.message || "Unable to load patient.");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const getPhoto = () => {
    const photo = patient?.User?.photo || patient?.user?.photo;

    if (!photo) {
      return patientImage;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  };

  if (loading) {
    return <div className="patient-record-loading">Loading patient...</div>;
  }

  if (error || !patient) {
    return (
      <div className="patient-record-error">
        <h2>Patient not found</h2>

        <p>{error}</p>

        <button onClick={() => navigate("/doctor/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const user = patient.User || patient.user || {};

  return (
    <div className="patient-view-page">
      <header className="patient-record-header">
        <button onClick={() => navigate("/doctor/dashboard")}>←</button>

        <h1>Patient Profile</h1>
      </header>

      <main className="patient-view-content">
        <section className="patient-profile-card">
          <img
            src={getPhoto()}
            alt={user.name || "Patient"}
            onError={(event) => {
              event.currentTarget.src = patientImage;
            }}
          />

          <div>
            <h2>{user.name || "Patient"}</h2>

            <p>
              {patient.age || "--"} years
              {" • "}
              {patient.gender || "Not specified"}
            </p>
          </div>
        </section>

        <section className="patient-info-card">
          <h2>Personal Information</h2>

          <div className="patient-info-grid">
            <div>
              <span>Mobile</span>

              <strong>{user.mobile || "Not available"}</strong>
            </div>

            <div>
              <span>Age</span>

              <strong>{patient.age || "--"}</strong>
            </div>

            <div>
              <span>Gender</span>

              <strong>{patient.gender || "Not specified"}</strong>
            </div>

            <div>
              <span>Address</span>

              <strong>{patient.address || "Not available"}</strong>
            </div>

            <div>
              <span>Emergency Contact</span>

              <strong>{patient.emergencyContact || "Not available"}</strong>
            </div>
          </div>
        </section>

        <section className="patient-info-card">
          <h2>Latest Visit</h2>

          {latestVisit ? (
            <div className="latest-visit">
              <p>
                <strong>Token:</strong> #{latestVisit.tokenNumber}
              </p>

              <p>
                <strong>Date:</strong> {latestVisit.date}
              </p>

              <p>
                <strong>Status:</strong> {latestVisit.status}
              </p>

              <p>
                <strong>Type:</strong> {latestVisit.tokenType}
              </p>
            </div>
          ) : (
            <p>No visit found.</p>
          )}
        </section>

        <div className="patient-record-actions">
          <button
            onClick={() => navigate(`/doctor/patient/${patientId}/history`)}
          >
            View History
          </button>

          <button
            onClick={() =>
              navigate(`/doctor/patient/${patientId}/prescription`)
            }
          >
            Prescription
          </button>
        </div>
      </main>
    </div>
  );
};

export default PatientView;
