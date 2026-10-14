import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import patientImage from "../../assets/images/patient.png";

import "./PendingPatients.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PendingPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingPatients();
  }, []);

  const loadPendingPatients = async () => {
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
        throw new Error(data?.message || "Failed to load pending patients");
      }

      const queue = data?.queue || data?.data?.queue || [];

      // Only WAITING patients are pending.
      const pendingPatients = Array.isArray(queue)
        ? queue.filter(
            (patient) => String(patient.status).toLowerCase() === "waiting",
          )
        : [];

      setPatients(pendingPatients);
    } catch (error) {
      console.error("Pending patients error:", error);

      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="pending-patients-page">
      <header className="pending-header">
        <button type="button" onClick={() => navigate("/doctor/dashboard")}>
          ←
        </button>

        <div>
          <h1>Pending Patients</h1>

          <p>Patients waiting for consultation</p>
        </div>
      </header>

      <main className="pending-content">
        <div className="pending-count">
          <strong>{patients.length}</strong>

          <span>Pending</span>
        </div>

        {loading ? (
          <div className="pending-empty">Loading pending patients...</div>
        ) : patients.length === 0 ? (
          <div className="pending-empty">
            <span>✓</span>

            <h2>No pending patients</h2>

            <p>All patients are currently handled.</p>
          </div>
        ) : (
          <div className="pending-list">
            {patients.map((patient) => {
              const patientId = patient.patientId;

              return (
                <article className="pending-card" key={patient.id}>
                  <img
                    src={getPhoto(patient)}
                    alt={getName(patient)}
                    onError={(event) => {
                      event.currentTarget.src = patientImage;
                    }}
                  />

                  <div className="pending-info">
                    <h3>{getName(patient)}</h3>

                    <p>Token #{patient.tokenNumber || "--"}</p>

                    <small>
                      Appointment: {patient.appointmentTime || "--"}
                    </small>

                    <small>Waiting for consultation</small>
                  </div>

                  <span className="pending-badge">Waiting</span>

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

export default PendingPatients;
