import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import authService from "../../services/authService";
import doctorImage from "../../assets/images/doctor.jpeg";
import patientImage from "../../assets/images/patient.png";

import "./DoctorDashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TIMER_STORAGE_KEY = "nirogahub_consultation_start";

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [queue, setQueue] = useState([]);

  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState("");
  const [queueActionLoading, setQueueActionLoading] = useState(false);

  const [consultationSeconds, setConsultationSeconds] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState("");

  const patientsPerPage = 4;

  // CONSULTATION TIMER HELPERS

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(remainingSeconds).padStart(2, "0"),
    ].join(":");
  };

  const saveConsultationStart = (tokenId) => {
    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({
        tokenId,
        startTime: Date.now(),
      }),
    );

    setConsultationSeconds(0);
  };

  const clearConsultationStart = () => {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setConsultationSeconds(0);
  };

  const restoreConsultationTimer = (currentPatient) => {
    if (!currentPatient) {
      clearConsultationStart();
      return;
    }

    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);

    if (!savedTimer) {
      saveConsultationStart(currentPatient.id);
      return;
    }

    try {
      const parsedTimer = JSON.parse(savedTimer);

      if (Number(parsedTimer.tokenId) !== Number(currentPatient.id)) {
        saveConsultationStart(currentPatient.id);
        return;
      }

      const elapsed = Math.floor(
        (Date.now() - Number(parsedTimer.startTime)) / 1000,
      );

      setConsultationSeconds(Math.max(0, elapsed));
    } catch (timerError) {
      console.error("Timer restore error:", timerError);
      saveConsultationStart(currentPatient.id);
    }
  };

  // LOAD DOCTOR PROFILE

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const response = await authService.getMe();

        const user =
          response?.user || response?.data?.user || response?.data || response;

        setDoctor(user);
      } catch (loadError) {
        console.error("Doctor dashboard error:", loadError);
        setError("Unable to load doctor information.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, []);

  // LOAD DOCTOR PATIENTS

  const loadDoctorPatients = async () => {
    try {
      setPatientsLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/doctors/patients`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load patients");
      }

      const patientList =
        data?.patients || data?.data?.patients || data?.data || [];

      setPatients(Array.isArray(patientList) ? patientList : []);
    } catch (loadError) {
      console.error("Load patients error:", loadError);
      setPatients([]);
      setError(loadError.message || "Unable to load patients.");
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorPatients();
  }, []);

  // LOAD TODAY'S QUEUE

  const loadDoctorQueue = async () => {
    try {
      setQueueError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/doctors/queue/today`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load queue");
      }

      const queueList = data?.queue || data?.data?.queue || [];
      const normalizedQueue = Array.isArray(queueList) ? queueList : [];

      setQueue(normalizedQueue);

      const currentPatient = normalizedQueue.find(
        (item) => String(item.status).toLowerCase() === "called",
      );

      restoreConsultationTimer(currentPatient);

      return data;
    } catch (loadError) {
      console.error("Load queue error:", loadError);

      setQueue([]);
      setQueueError(loadError.message || "Unable to load today's queue.");

      return null;
    }
  };

  useEffect(() => {
    const loadQueue = async () => {
      try {
        setQueueLoading(true);
        await loadDoctorQueue();
      } finally {
        setQueueLoading(false);
      }
    };

    loadQueue();
  }, []);

  // SOCKET.IO ROOM IDENTIFIERS

  const socketDoctorId =
    doctor?.doctorId ||
    doctor?.Doctor?.id ||
    doctor?.doctor?.id ||
    doctor?.doctorProfile?.id ||
    queue.find((item) => item?.doctorId)?.doctorId ||
    null;

  const socketClinicId =
    doctor?.clinicId ||
    doctor?.Clinic?.id ||
    doctor?.clinic?.id ||
    doctor?.doctorProfile?.clinicId ||
    queue.find((item) => item?.clinicId)?.clinicId ||
    null;

  // SOCKET.IO REAL-TIME QUEUE UPDATES

  useEffect(() => {
    if (!socketDoctorId || !socketClinicId) {
      return undefined;
    }

    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    const roomDetails = {
      doctorId: socketDoctorId,
      clinicId: socketClinicId,
    };

    const joinQueueRoom = () => {
      socket.emit("joinQueue", roomDetails);
    };

    const handleQueueUpdated = (payload = {}) => {
      if (
        payload.doctorId &&
        String(payload.doctorId) !== String(socketDoctorId)
      ) {
        return;
      }

      if (
        payload.clinicId &&
        String(payload.clinicId) !== String(socketClinicId)
      ) {
        return;
      }

      void loadDoctorQueue();
      void loadDoctorPatients();
    };

    socket.on("connect", joinQueueRoom);
    socket.on("queueUpdated", handleQueueUpdated);

    if (socket.connected) {
      joinQueueRoom();
    }

    return () => {
      socket.emit("leaveQueue", roomDetails);
      socket.off("connect", joinQueueRoom);
      socket.off("queueUpdated", handleQueueUpdated);
      socket.disconnect();
    };
  }, [socketDoctorId, socketClinicId]);

  // QUEUE STATUS

  const currentQueuePatient = queue.find(
    (item) => String(item.status).toLowerCase() === "called",
  );

  const waitingQueue = queue
    .filter((item) => String(item.status).toLowerCase() === "waiting")
    .sort((a, b) => Number(a.tokenNumber || 0) - Number(b.tokenNumber || 0));

  const nextQueuePatient = waitingQueue.length > 0 ? waitingQueue[0] : null;

  const completedQueue = queue
    .filter((item) => String(item.status).toLowerCase() === "completed")
    .sort((a, b) => Number(b.tokenNumber || 0) - Number(a.tokenNumber || 0));

  const queuePreview = useMemo(() => {
    const preview = [];
    const latestCompleted = completedQueue[0] || null;

    if (latestCompleted) {
      preview.push(latestCompleted);
    }

    if (
      nextQueuePatient &&
      Number(nextQueuePatient.id) !== Number(latestCompleted?.id)
    ) {
      preview.push(nextQueuePatient);
    }

    return preview;
  }, [completedQueue, nextQueuePatient]);

  const todayPatientsCount = queue.length;
  const pendingPatientsCount = waitingQueue.length;
  const completedPatientsCount = completedQueue.length;

  const appointmentPatientsCount = queue.filter((item) => {
    const status = String(item.status).toLowerCase();
    return status === "waiting" || status === "called";
  }).length;

  // CONSULTATION TIMER

  useEffect(() => {
    if (!currentQueuePatient) {
      setConsultationSeconds(0);
      return undefined;
    }

    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);

    if (!savedTimer) {
      saveConsultationStart(currentQueuePatient.id);
    }

    const interval = setInterval(() => {
      const timerData = localStorage.getItem(TIMER_STORAGE_KEY);

      if (!timerData) {
        setConsultationSeconds(0);
        return;
      }

      try {
        const parsedTimer = JSON.parse(timerData);

        if (Number(parsedTimer.tokenId) !== Number(currentQueuePatient.id)) {
          setConsultationSeconds(0);
          return;
        }

        const elapsed = Math.floor(
          (Date.now() - Number(parsedTimer.startTime)) / 1000,
        );

        setConsultationSeconds(Math.max(0, elapsed));
      } catch (timerError) {
        console.error("Consultation timer error:", timerError);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQueuePatient?.id]);

  // CALL NEXT PATIENT

  const handleCallNext = async () => {
    try {
      setQueueActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/doctors/queue/call-next`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to call next patient");
      }

      const calledPatient = data?.currentPatient;

      if (calledPatient?.tokenId != null) {
        saveConsultationStart(calledPatient.tokenId);
      } else if (calledPatient?.id != null) {
        saveConsultationStart(calledPatient.id);
      }

      await loadDoctorQueue();
      await loadDoctorPatients();

      setFilter("all");
      setCurrentPage(1);
    } catch (actionError) {
      console.error("Call next error:", actionError);
      alert(actionError.message || "Unable to call next patient");
    } finally {
      setQueueActionLoading(false);
    }
  };

  // COMPLETE CURRENT PATIENT AND CALL NEXT

  const handleCompleteAndNext = async () => {
    try {
      setQueueActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/doctors/queue/complete-and-next`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update queue");
      }

      if (data?.nextPatient?.tokenId != null) {
        saveConsultationStart(data.nextPatient.tokenId);
      } else if (data?.nextPatient?.id != null) {
        saveConsultationStart(data.nextPatient.id);
      } else {
        clearConsultationStart();
      }

      await loadDoctorQueue();
      await loadDoctorPatients();

      setFilter("all");
      setCurrentPage(1);
    } catch (actionError) {
      console.error("Complete and next error:", actionError);
      alert(actionError.message || "Unable to update queue");
    } finally {
      setQueueActionLoading(false);
    }
  };

  const getPatientRawStatus = (patient) => {
    const tokenId = patient?.tokenId ?? patient?.id;

    if (tokenId != null) {
      const matchedToken = queue.find(
        (item) => Number(item.id) === Number(tokenId),
      );

      if (matchedToken?.status) {
        return String(matchedToken.status).toLowerCase();
      }
    }

    // Use the status returned by the patients endpoint
    // if the token is not present in today's queue.
    const apiStatus = String(patient?.status || "").toLowerCase();

    if (["waiting", "called", "completed", "cancelled"].includes(apiStatus)) {
      return apiStatus;
    }

    return "waiting";
  };

  const getPatientStatus = (patient) => {
    const status = getPatientRawStatus(patient);

    switch (status) {
      case "completed":
        return "Completed";
      case "called":
        return "In Consultation";
      case "cancelled":
        return "Cancelled";
      default:
        return "Waiting";
    }
  };

  const getPatientStatusClass = (patient) => {
    const status = getPatientRawStatus(patient);

    if (status === "completed") return "completed";
    if (status === "called") return "called";
    if (status === "cancelled") return "cancelled";

    return "waiting";
  };

  // SEARCH AND FILTER PATIENTS

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchValue = search.toLowerCase().trim();

      const patientName =
        patient.patientName ||
        patient.User?.name ||
        patient.user?.name ||
        patient.name ||
        "";

      const problem = patient.problem || "General Consultation";

      const department =
        patient.department || patient.specialization || "General Medicine";

      const status = getPatientRawStatus(patient);

      const matchesSearch =
        patientName.toLowerCase().includes(searchValue) ||
        problem.toLowerCase().includes(searchValue) ||
        department.toLowerCase().includes(searchValue);

      const matchesFilter = filter === "all" || status === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [patients, queue, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientsPerPage),
  );

  const visiblePatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage,
  );

  // IMAGE HELPERS

  const doctorPhoto = doctor?.photo
    ? doctor.photo.startsWith("http")
      ? doctor.photo
      : `${API_BASE_URL}${doctor.photo}`
    : doctorImage;

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handlePatientView = (patientId) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  const handlePatientHistory = (patientId) => {
    navigate(`/doctor/patient/${patientId}/history`);
  };

  const handlePrescription = (patientId) => {
    navigate(`/doctor/patient/${patientId}/prescription`);
  };

  const getPatientName = (patient) => {
    return (
      patient?.patientName ||
      patient?.User?.name ||
      patient?.user?.name ||
      patient?.name ||
      "Patient"
    );
  };

  const getPatientAge = (patient) => {
    return patient?.age ?? patient?.patientAge ?? "--";
  };

  const getPatientGender = (patient) => {
    return patient?.gender || patient?.patientGender || "Other";
  };

  const getPatientProblem = (patient) => {
    return patient?.problem || "General Consultation";
  };

  const getPatientDepartment = (patient) => {
    return patient?.department || patient?.specialization || "General Medicine";
  };

  const getLastVisit = (patient) => {
    return patient?.lastVisit || "No visit yet";
  };

  const getPatientPhoto = (patient) => {
    const photo = patient?.photo || patient?.patientPhoto || "";

    if (!photo) return patientImage;
    if (photo.startsWith("http")) return photo;

    return `${API_BASE_URL}${photo}`;
  };

  if (loading) {
    return (
      <div className="doctor-dashboard-loading">
        <div className="doctor-dashboard-loader">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <header className="doctor-dashboard-header">
        <button
          type="button"
          className="doctor-header-profile"
          onClick={() => navigate("/doctor/profile")}
        >
          <img
            src={doctorPhoto}
            alt="Doctor"
            onError={(event) => {
              event.currentTarget.src = doctorImage;
            }}
          />
        </button>

        <div className="doctor-brand">
          <span className="doctor-brand-icon">♥</span>
          <span>NirogaHub</span>
        </div>

        <div className="doctor-greeting">
          Hi, Dr. {doctor?.name || "Doctor"}!
        </div>
      </header>

      <main className="doctor-dashboard-content">
        {/* DASHBOARD STATISTICS */}
        <section className="doctor-stats-grid">
          <button
            type="button"
            className="doctor-stat-card patients-stat"
            onClick={() =>
              navigate("/doctor/today-patients", {
                state: { queue, filter: "today" },
              })
            }
          >
            <div className="doctor-stat-icon">
              <span>👥</span>
            </div>

            <div className="doctor-stat-info">
              <span>Today's Patients</span>
              <strong>{todayPatientsCount}</strong>
            </div>

            <span className="doctor-stat-arrow">›</span>
          </button>

          <button
            type="button"
            className="doctor-stat-card appointment-stat"
            onClick={() =>
              navigate("/doctor/appointments", {
                state: { queue, filter: "appointments" },
              })
            }
          >
            <div className="doctor-stat-icon">
              <span>▣</span>
            </div>

            <div className="doctor-stat-info">
              <span>Appointments</span>
              <strong>{appointmentPatientsCount}</strong>
            </div>

            <span className="doctor-stat-arrow">›</span>
          </button>

          <button
            type="button"
            className="doctor-stat-card pending-stat"
            onClick={() =>
              navigate("/doctor/pending", {
                state: { queue, filter: "waiting" },
              })
            }
          >
            <div className="doctor-stat-icon">
              <span>◷</span>
            </div>

            <div className="doctor-stat-info">
              <span>Pending</span>
              <strong>{pendingPatientsCount}</strong>
            </div>

            <span className="doctor-stat-arrow">›</span>
          </button>

          <button
            type="button"
            className="doctor-stat-card completed-stat"
            onClick={() =>
              navigate("/doctor/completed", {
                state: { queue, filter: "completed" },
              })
            }
          >
            <div className="doctor-stat-icon">
              <span>✓</span>
            </div>

            <div className="doctor-stat-info">
              <span>Completed</span>
              <strong>{completedPatientsCount}</strong>
            </div>

            <span className="doctor-stat-arrow">›</span>
          </button>
        </section>

        {/* TODAY'S QUEUE */}
        <section className="doctor-queue-section">
          <div className="doctor-section-title">
            <h2>
              <span className="section-title-icon">▣</span>
              Today's Queue
            </h2>

            <span className="queue-gap-label">5 min gap</span>
          </div>

          {queueLoading ? (
            <div className="doctor-no-appointments">
              Loading today's queue...
            </div>
          ) : queueError ? (
            <div className="doctor-no-appointments error-state">
              {queueError}
            </div>
          ) : queue.length === 0 ? (
            <div className="doctor-no-appointments">
              No patients in today's queue.
            </div>
          ) : (
            <>
              <div
                className={`current-patient-card ${
                  currentQueuePatient
                    ? "has-current-patient"
                    : "has-next-patient"
                }`}
              >
                <div className="current-patient-info">
                  <span className="queue-label">
                    {currentQueuePatient ? "CURRENT PATIENT" : "NEXT PATIENT"}
                  </span>

                  <div className="current-patient-main">
                    <div className="appointment-patient-avatar">
                      <img
                        src={getPatientPhoto(
                          currentQueuePatient || nextQueuePatient,
                        )}
                        alt={
                          (currentQueuePatient || nextQueuePatient)
                            ?.patientName || "Patient"
                        }
                        onError={(event) => {
                          event.currentTarget.src = patientImage;
                        }}
                      />
                    </div>

                    <div className="current-patient-details">
                      <strong>
                        {(currentQueuePatient || nextQueuePatient)
                          ?.patientName || "No patient"}
                      </strong>

                      <span>
                        Token #
                        {(currentQueuePatient || nextQueuePatient)
                          ?.tokenNumber || "--"}
                      </span>

                      <span>
                        Appointment:{" "}
                        {(currentQueuePatient || nextQueuePatient)
                          ?.appointmentTime || "--"}
                      </span>
                    </div>
                  </div>

                  {currentQueuePatient && (
                    <div className="consultation-timer">
                      <span className="timer-dot" />
                      <span>Consultation Time</span>
                      <strong>{formatTimer(consultationSeconds)}</strong>
                    </div>
                  )}
                </div>

                <div className="current-patient-action">
                  {currentQueuePatient ? (
                    <button
                      type="button"
                      className="complete-next-button"
                      onClick={handleCompleteAndNext}
                      disabled={queueActionLoading}
                    >
                      {queueActionLoading ? "Processing..." : "Complete & Next"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="complete-next-button"
                      onClick={handleCallNext}
                      disabled={queueActionLoading || !nextQueuePatient}
                    >
                      {queueActionLoading ? "Calling..." : "Call Next Patient"}
                    </button>
                  )}
                </div>
              </div>

              {queuePreview.length > 0 && (
                <div className="queue-preview">
                  <div className="queue-preview-header">
                    <span>Queue Preview</span>
                    <small>Completed & Next</small>
                  </div>

                  <div className="queue-list">
                    {queuePreview.map((item) => {
                      const itemStatus = String(item.status).toLowerCase();
                      const isCompleted = itemStatus === "completed";

                      return (
                        <div
                          key={item.id}
                          className={`queue-item ${
                            isCompleted ? "completed" : "waiting"
                          }`}
                        >
                          <div className="queue-number">
                            #{item.tokenNumber}
                          </div>

                          <div className="queue-patient">
                            <strong>{item.patientName}</strong>
                            <span>{item.appointmentTime}</span>
                          </div>

                          <div
                            className={`queue-status ${
                              isCompleted
                                ? "completed-status"
                                : "waiting-status"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Waiting"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* SEARCH AND FILTER */}
        <section className="doctor-search-section">
          <div className="doctor-search-box">
            <span className="doctor-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <select
            className="doctor-filter-button"
            value={filter}
            onChange={(event) => handleFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="waiting">Waiting</option>
            <option value="called">In Consultation</option>
            <option value="completed">Completed</option>
          </select>
        </section>

        {/* PATIENTS HEADING */}
        <section className="doctor-patients-heading">
          <div>
            <h2>
              {filter === "completed"
                ? "Completed Patients"
                : filter === "waiting"
                  ? "Waiting Patients"
                  : filter === "called"
                    ? "In Consultation"
                    : "My Patients"}
            </h2>

            <span>{filteredPatients.length} patients shown</span>
          </div>
        </section>

        {/* PATIENT LIST */}
        <section className="doctor-patients-list">
          {patientsLoading ? (
            <div className="doctor-no-patients">
              <span>◷</span>
              <h3>Loading patients...</h3>
              <p>Please wait while we fetch your patients.</p>
            </div>
          ) : visiblePatients.length > 0 ? (
            visiblePatients.map((patient) => {
              const patientName = getPatientName(patient);
              const patientAge = getPatientAge(patient);
              const patientGender = getPatientGender(patient);
              const patientProblem = getPatientProblem(patient);
              const patientDepartment = getPatientDepartment(patient);
              const patientStatus = getPatientStatus(patient);
              const patientStatusClass = getPatientStatusClass(patient);
              const lastVisit = getLastVisit(patient);

              // This ID is used by the patient details/history routes.
              // Backend currently returns token.id as patient.id.
              const patientId = patient.tokenId ?? patient.id;

              return (
                <article
                  className={`doctor-patient-card ${
                    patientStatusClass === "completed"
                      ? "completed-patient-card"
                      : ""
                  }`}
                  key={patientId}
                >
                  <div className="patient-avatar">
                    <img
                      src={getPatientPhoto(patient)}
                      alt={patientName}
                      onError={(event) => {
                        event.currentTarget.src = patientImage;
                      }}
                    />
                  </div>

                  <div className="patient-details">
                    <div className="patient-name-row">
                      <div className="patient-basic-info">
                        <h3>{patientName}</h3>

                        <span className="patient-age">{patientAge} years</span>

                        <span className="patient-meta-dot">•</span>

                        <span className="patient-gender">{patientGender}</span>

                        <span
                          className={
                            patientGender.toLowerCase() === "female"
                              ? "female-symbol"
                              : "male-symbol"
                          }
                        >
                          {patientGender.toLowerCase() === "female" ? "♀" : "♂"}
                        </span>
                      </div>

                      <span className={`patient-status ${patientStatusClass}`}>
                        {patientStatus}
                      </span>
                    </div>

                    <div className="patient-medical-info">
                      <span>▣ Last visit: {lastVisit}</span>

                      <span className="medical-separator">|</span>

                      <span className="patient-problem">
                        ♡ {patientProblem} ({patientDepartment})
                      </span>
                    </div>

                    <div className="patient-card-actions">
                      <button
                        type="button"
                        onClick={() => handlePatientView(patientId)}
                      >
                        View Patient
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePatientHistory(patientId)}
                      >
                        History
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrescription(patientId)}
                      >
                        Prescription
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="doctor-no-patients">
              <span>◷</span>
              <h3>No patients found</h3>
              <p>Try changing your search or filter.</p>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {!patientsLoading && filteredPatients.length > patientsPerPage && (
          <div className="doctor-pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {error && <p className="doctor-dashboard-error">{error}</p>}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="doctor-bottom-nav">
        <button
          type="button"
          className="doctor-nav-item active"
          onClick={() => navigate("/doctor/dashboard")}
        >
          <span className="doctor-nav-icon">⌂</span>
          <strong>Dashboard</strong>
        </button>

        <button
          type="button"
          className="doctor-nav-item"
          onClick={() => navigate("/doctor/completed")}
        >
          <span className="doctor-nav-icon">👥</span>
          <strong>Patients</strong>
        </button>

        <button
          type="button"
          className="doctor-nav-item"
          onClick={() =>
            navigate("/doctor/appointments", {
              state: { queue, filter: "appointments" },
            })
          }
        >
          <span className="doctor-nav-icon">▣</span>
          <strong>Appointments</strong>
        </button>

        <button
          type="button"
          className="doctor-nav-item"
          onClick={() => navigate("/doctor/profile")}
        >
          <span className="doctor-nav-icon">●</span>
          <strong>Profile</strong>
        </button>
      </nav>
    </div>
  );
};

export default DoctorDashboard;
