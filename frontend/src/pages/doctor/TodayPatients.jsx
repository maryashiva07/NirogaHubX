import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import patientImage from "../../assets/images/patient.png";

import "./TodayPatients.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TodayPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
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
        throw new Error(data?.message || "Failed to load today's patients");
      }

      const queue = data?.queue || data?.data?.queue || [];

      setPatients(Array.isArray(queue) ? queue : []);
    } catch (error) {
      console.error("Today patients error:", error);

      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patient) => {
    return (
      patient?.patientName ||
      patient?.Patient?.User?.name ||
      patient?.Patient?.user?.name ||
      "Patient"
    );
  };

  const getPatientPhoto = (patient) => {
    const photo =
      patient?.Patient?.User?.photo ||
      patient?.Patient?.user?.photo ||
      patient?.patientPhoto ||
      "";

    if (!photo) {
      return patientImage;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${photo}`;
  };

  const getPatientAge = (patient) => {
    return patient?.patientAge || patient?.Patient?.age || "--";
  };

  const getPatientGender = (patient) => {
    return patient?.patientGender || patient?.Patient?.gender || "Other";
  };

  const getStatus = (patient) => {
    const status = String(patient?.status || "waiting").toLowerCase();

    if (status === "completed") {
      return "Completed";
    }

    if (status === "called") {
      return "In Consultation";
    }

    return "Waiting";
  };

  const getStatusClass = (patient) => {
    const status = String(patient?.status || "waiting").toLowerCase();

    if (status === "completed") {
      return "completed";
    }

    if (status === "called") {
      return "in-consultation";
    }

    return "waiting";
  };

  return (
    <div className="today-patients-page">
      <header className="today-patients-header">
        <button
          type="button"
          onClick={() => navigate("/doctor/dashboard")}
          className="today-back-button"
        >
          ←
        </button>

        <div>
          <h1>Today's Patients</h1>

          <p>Patients who have visited you today</p>
        </div>
      </header>

      <main className="today-patients-content">
        <div className="today-patients-count">
          <strong>{patients.length}</strong>

          <span>Patients Today</span>
        </div>

        {loading ? (
          <div className="today-loading">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="today-empty">
            <span>👥</span>

            <h2>No patients today</h2>

            <p>Your today's patients will appear here.</p>
          </div>
        ) : (
          <div className="today-patients-list">
            {patients.map((patient) => {
              const patientId = patient.patientId;

              return (
                <article className="today-patient-card" key={patient.id}>
                  <img
                    src={getPatientPhoto(patient)}
                    alt={getPatientName(patient)}
                    onError={(event) => {
                      event.currentTarget.src = patientImage;
                    }}
                  />

                  <div className="today-patient-info">
                    <h3>{getPatientName(patient)}</h3>

                    <p>
                      {getPatientAge(patient)} years
                      <span>•</span>
                      {getPatientGender(patient)}
                    </p>

                    <small>Token #{patient.tokenNumber || "--"}</small>

                    <small>
                      Appointment: {patient.appointmentTime || "--"}
                    </small>
                  </div>

                  <span className={`today-status ${getStatusClass(patient)}`}>
                    {getStatus(patient)}
                  </span>

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

        <button type="button" className="active">
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

export default TodayPatients;
