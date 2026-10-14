import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import patientImage from "../../assets/images/patient.png";

import "./CompletedPatients.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CompletedPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD TODAY'S QUEUE

  useEffect(() => {
    loadCompletedPatients();
  }, []);

  const loadCompletedPatients = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/doctors/queue/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load completed patients");
      }

      const queue = data?.queue || data?.data?.queue || [];

      // IMPORTANT:
      // Same logic as DoctorDashboard.
      const completedPatients = Array.isArray(queue)
        ? queue.filter(
            (patient) => String(patient.status).toLowerCase() === "completed",
          )
        : [];

      setPatients(completedPatients);
    } catch (error) {
      console.error("Completed patients error:", error);

      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // HELPERS

  const getName = (patient) => {
    return (
      patient?.patientName ||
      patient?.Patient?.User?.name ||
      patient?.Patient?.user?.name ||
      "Patient"
    );
  };

  const getPhoto = (patient) => {
    const photo =
      patient?.Patient?.User?.photo ||
      patient?.Patient?.user?.photo ||
      patient?.patientPhoto ||
      "";

    if (!photo) {
      return patientImage;
    }

    return photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`;
  };

  return (
    <div className="completed-patients-page">
      <header className="completed-header">
        <button type="button" onClick={() => navigate("/doctor/dashboard")}>
          ←
        </button>

        <div>
          <h1>Completed Patients</h1>

          <p>Patients whose consultation is completed</p>
        </div>
      </header>

      <main className="completed-content">
        <div className="completed-count">
          <strong>{patients.length}</strong>

          <span>Completed</span>
        </div>

        {loading ? (
          <div className="completed-empty">Loading completed patients...</div>
        ) : patients.length === 0 ? (
          <div className="completed-empty">
            <span>✓</span>

            <h2>No completed patients</h2>

            <p>Completed consultations will appear here.</p>
          </div>
        ) : (
          <div className="completed-list">
            {patients.map((patient) => {
              const patientId = patient.patientId;

              return (
                <article className="completed-card" key={patient.id}>
                  <img
                    src={getPhoto(patient)}
                    alt={getName(patient)}
                    onError={(event) => {
                      event.currentTarget.src = patientImage;
                    }}
                  />

                  <div className="completed-info">
                    <h3>{getName(patient)}</h3>

                    <p>Token #{patient.tokenNumber || "--"}</p>

                    <small>
                      Appointment: {patient.appointmentTime || "--"}
                    </small>

                    <small>Consultation completed</small>
                  </div>

                  <span className="completed-badge">Completed</span>

                  <button
                    type="button"
                    onClick={() => navigate(`/doctor/patient/${patientId}`)}
                  >
                    View
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <nav className="doctor-bottom-navigation">
        <button type="button" onClick={() => navigate("/doctor/dashboard")}>
          ⌂<span>Dashboard</span>
        </button>

        <button type="button" onClick={() => navigate("/doctor/patients")}>
          👥
          <span>Patients</span>
        </button>

        <button type="button" onClick={() => navigate("/doctor/appointments")}>
          ▣<span>Appointments</span>
        </button>

        <button type="button" onClick={() => navigate("/doctor/profile")}>
          ●<span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default CompletedPatients;
