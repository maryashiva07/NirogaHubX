import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import patientImage from "../../assets/images/patient.png";

import "./DoctorAppointment.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DoctorAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD TODAY'S QUEUE

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
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
        throw new Error(data?.message || "Failed to load appointments");
      }

      const queue = data?.queue || data?.data?.queue || [];

      setAppointments(Array.isArray(queue) ? queue : []);
    } catch (error) {
      console.error("Appointments error:", error);

      setAppointments([]);
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
    <div className="doctor-appointments-page">
      <header className="doctor-appointments-header">
        <button type="button" onClick={() => navigate("/doctor/dashboard")}>
          ←
        </button>

        <div>
          <h1>Appointments</h1>

          <p>Manage your patient appointments</p>
        </div>
      </header>

      <main className="doctor-appointments-content">
        <div className="appointments-summary">
          <strong>{appointments.length}</strong>

          <span>Total Appointments</span>
        </div>

        {loading ? (
          <div className="appointments-empty">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="appointments-empty">
            <span>▣</span>

            <h2>No appointments</h2>

            <p>Your appointments will appear here.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((patient) => {
              const patientId = patient.patientId;

              const status = getStatus(patient);

              return (
                <article className="appointment-item" key={patient.id}>
                  <img
                    src={getPhoto(patient)}
                    alt={getName(patient)}
                    onError={(event) => {
                      event.currentTarget.src = patientImage;
                    }}
                  />

                  <div className="appointment-item-info">
                    <h3>{getName(patient)}</h3>

                    <p>Token #{patient.tokenNumber || "--"}</p>

                    <span>Appointment: {patient.appointmentTime || "--"}</span>
                  </div>

                  <span
                    className={`appointment-item-status ${getStatusClass(
                      patient,
                    )}`}
                  >
                    {status}
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

        <button type="button" onClick={() => navigate("/doctor/patients")}>
          👥
          <span>Patients</span>
        </button>

        <button type="button" className="active">
          ▣<span>Appointments</span>
        </button>

        <button type="button" onClick={() => navigate("/doctor/profile")}>
          ●<span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default DoctorAppointments;
