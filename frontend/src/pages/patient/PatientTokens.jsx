import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import tokenService from "../../services/tokenService";
import doctorImage from "../../assets/images/doctor.jpeg";

import "./PatientTokens.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const PatientTokens = () => {
  const navigate = useNavigate();

  const [tokens, setTokens] = useState([]);
  const [queueData, setQueueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const socketRef = useRef(null);
  const mountedRef = useRef(false);
  const joinedRoomsRef = useRef(new Set());

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadQueuePositions = useCallback(async (patientTokens) => {
    if (!patientTokens.length) {
      if (mountedRef.current) setQueueData({});
      return;
    }

    const results = await Promise.allSettled(
      patientTokens.map(async (token) => {
        const response = await axios.get(
          `${API_BASE_URL}/api/tokens/queue-position/${token.id}`,
          { headers: getAuthHeaders() },
        );

        return {
          tokenId: token.id,
          data: response.data.queuePosition,
        };
      }),
    );

    if (!mountedRef.current) return;

    setQueueData((previous) => {
      const next = { ...previous };

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          next[String(result.value.tokenId)] = result.value.data;
        }
      });

      return next;
    });
  }, []);

  const loadTokens = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader && mountedRef.current) setLoading(true);

        setError("");

        const response = await tokenService.getMyTokens();

        if (!mountedRef.current) return;

        if (!response.success) {
          setError(response.message || "Unable to load your tokens.");
          return;
        }

        const patientTokens = response.tokens || [];
        setTokens(patientTokens);

        const socket = socketRef.current;

        if (socket?.connected) {
          patientTokens.forEach((token) => {
            const doctorId = token.doctorId ?? token.Doctor?.id;
            const clinicId = token.clinicId ?? token.Clinic?.id;

            if (!doctorId || !clinicId) return;

            const roomKey = `${doctorId}:${clinicId}`;

            if (joinedRoomsRef.current.has(roomKey)) return;

            joinedRoomsRef.current.add(roomKey);
            socket.emit("joinQueue", { doctorId, clinicId });
          });
        }

        await loadQueuePositions(patientTokens);
      } catch (err) {
        console.error("Failed to load tokens:", err);

        if (!mountedRef.current) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/patient");
          return;
        }

        setError(err.response?.data?.message || "Unable to load your tokens.");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [navigate, loadQueuePositions],
  );

  useEffect(() => {
    mountedRef.current = true;

    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const handleConnect = () => {
      joinedRoomsRef.current.clear();
      loadTokens();
    };

    const handleQueueUpdated = (event) => {
      console.log("Live queue update:", event);

      if (event?.tokenId && event?.status) {
        setTokens((previous) =>
          previous.map((token) =>
            String(token.id) === String(event.tokenId)
              ? { ...token, status: event.status }
              : token,
          ),
        );
      }

      loadTokens();
    };

    const handleConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    socket.on("connect", handleConnect);
    socket.on("queueUpdated", handleQueueUpdated);
    socket.on("connect_error", handleConnectError);

    loadTokens();

    return () => {
      mountedRef.current = false;

      socket.off("connect", handleConnect);
      socket.off("queueUpdated", handleQueueUpdated);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();

      socketRef.current = null;
      joinedRoomsRef.current.clear();
    };
  }, [loadTokens]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDoctorImage = (doctor) => {
    const photo = doctor?.profileImage || doctor?.User?.photo;

    if (!photo) return doctorImage;

    if (/^(https?:\/\/|blob:)/i.test(photo)) return photo;

    return `${API_BASE_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "waiting":
        return "status-waiting";
      case "called":
        return "status-called";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "payment_pending":
        return "status-waiting";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "called":
        return "Your Turn";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "payment_pending":
        return "Payment Pending";
      default:
        return status || "Unknown";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeLeft = (milliseconds) => {
    if (milliseconds <= 0) return "Expected time reached";

    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m remaining`;

    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  const getAppointmentCountdown = (appointmentTime) => {
    if (!appointmentTime) return null;

    const parts = String(appointmentTime).split(":").map(Number);

    if (parts.length < 2 || parts.some(Number.isNaN)) return null;

    const appointment = new Date();
    appointment.setHours(parts[0], parts[1], parts[2] || 0, 0);

    return formatTimeLeft(appointment.getTime() - currentTime);
  };

  if (loading) {
    return (
      <main className="patient-tokens-page">
        <header className="patient-tokens-header">
          <button
            type="button"
            className="tokens-back-button"
            onClick={() => navigate("/patient/dashboard")}
          >
            ←
          </button>
          <h1>My Tokens</h1>
          <div className="tokens-header-space" />
        </header>

        <section className="patient-tokens-content">
          <div className="doctor-loading">
            <div className="loading-spinner" />
            <p>Loading your tokens...</p>
          </div>
        </section>

        <BottomNavigation navigate={navigate} />
      </main>
    );
  }

  const calledToken = tokens.find((token) => token.status === "called");

  return (
    <main className="patient-tokens-page">
      <header className="patient-tokens-header">
        <button
          type="button"
          className="tokens-back-button"
          onClick={() => navigate("/patient/dashboard")}
        >
          ←
        </button>
        <h1>My Tokens</h1>
        <div className="tokens-header-space" />
      </header>

      <section className="patient-tokens-content">
        <div className="tokens-intro">
          <h2>Your Tokens</h2>
          <p>Track your current and previous appointment tokens.</p>
        </div>

        {calledToken && (
          <div className="consulting-alert" role="status" aria-live="polite">
            <span className="consulting-alert-dot" />
            <div>
              <strong>YOU ARE CONSULTING</strong>
              <p>
                The doctor has called Token #{calledToken.tokenNumber}. Please
                proceed to the clinic.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
            <button
              type="button"
              className="tokens-retry-button"
              onClick={() => loadTokens(true)}
            >
              Retry
            </button>
          </div>
        )}

        {!error && tokens.length === 0 && (
          <div className="no-doctors">
            <div className="no-doctors-icon">🎟️</div>
            <h3>No tokens found</h3>
            <p>You haven't booked any token yet.</p>
            <button
              type="button"
              className="view-all-button"
              onClick={() => navigate("/patient/clinics")}
            >
              Find a Clinic
            </button>
          </div>
        )}

        {tokens.length > 0 && (
          <div className="token-list">
            {tokens.map((token) => {
              const queue = queueData[String(token.id)];

              return (
                <article className="token-card" key={token.id}>
                  <div className="token-card-top">
                    <div className="token-number-section">
                      <span className="token-label">Token Number</span>
                      <strong className="token-number">
                        #{token.tokenNumber}
                      </strong>
                    </div>

                    <span
                      className={`token-status ${getStatusClass(token.status)}`}
                    >
                      {getStatusText(token.status)}
                    </span>
                  </div>

                  {token.status === "called" && (
                    <div className="token-called-message">
                      It's your turn. Please proceed to the doctor.
                    </div>
                  )}

                  {token.status === "waiting" && queue && (
                    <div className="token-queue-info">
                      {queue.isNext ? (
                        <strong>You are next in the queue!</strong>
                      ) : (
                        <>
                          <strong>
                            {queue.patientsAhead} patient
                            {queue.patientsAhead === 1 ? "" : "s"} ahead
                          </strong>
                          {queue.estimatedWaitMinutes != null && (
                            <p>
                              Estimated wait: approximately{" "}
                              {queue.estimatedWaitMinutes} minutes
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {token.status === "waiting" && !queue && (
                    <div className="token-queue-info">
                      Checking your queue position...
                    </div>
                  )}

                  <div className="token-doctor-section">
                    <div className="token-doctor-avatar">
                      <img
                        src={getDoctorImage(token.Doctor)}
                        alt={token.Doctor?.User?.name || "Doctor"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = doctorImage;
                        }}
                      />
                    </div>

                    <div className="token-doctor-info">
                      <h3>{token.Doctor?.User?.name || "Doctor"}</h3>
                      <p>
                        {token.Doctor?.specialization || "General Physician"}
                      </p>
                      {token.Doctor?.experience != null && (
                        <span>{token.Doctor.experience} years experience</span>
                      )}
                    </div>
                  </div>

                  <div className="token-clinic-section">
                    <div className="token-detail">
                      <span className="detail-icon">🏥</span>
                      <div>
                        <small>Clinic</small>
                        <strong>
                          {token.Clinic?.name ||
                            token.Doctor?.clinicName ||
                            "Clinic"}
                        </strong>
                      </div>
                    </div>

                    <div className="token-detail">
                      <span className="detail-icon">📍</span>
                      <div>
                        <small>Address</small>
                        <strong>
                          {token.Clinic?.address || "Address not available"}
                        </strong>
                      </div>
                    </div>

                    {token.appointmentTime && (
                      <div className="token-detail">
                        <span className="detail-icon">🕒</span>
                        <div>
                          <small>Appointment Time</small>
                          <strong>{token.appointmentTime}</strong>
                        </div>
                      </div>
                    )}

                    {token.status === "waiting" && token.appointmentTime && (
                      <div className="token-detail">
                        <span className="detail-icon">⏳</span>
                        <div>
                          <small>Appointment countdown</small>
                          <strong>
                            {getAppointmentCountdown(token.appointmentTime) ||
                              "Time unavailable"}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="token-card-footer">
                    <span className="token-type">
                      {token.tokenType === "priority"
                        ? "Priority Token"
                        : "Normal Token"}
                    </span>
                    <span className="token-date">
                      📅 {formatDate(token.date)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <BottomNavigation navigate={navigate} />
    </main>
  );
};

const BottomNavigation = ({ navigate }) => (
  <nav className="patient-bottom-nav">
    <button
      type="button"
      className="bottom-nav-item"
      onClick={() => navigate("/patient/dashboard")}
    >
      <span className="bottom-icon">🏠</span>
      <span>Home</span>
    </button>

    <button
      type="button"
      className="bottom-nav-item"
      onClick={() => navigate("/patient/clinics")}
    >
      <span className="bottom-icon">🏥</span>
      <span>Clinics</span>
    </button>

    <button
      type="button"
      className="bottom-nav-item active"
      onClick={() => navigate("/patient/tokens")}
    >
      <span className="bottom-icon">🎟️</span>
      <span>My Token</span>
    </button>

    <button
      type="button"
      className="bottom-nav-item"
      onClick={() => navigate("/patient/profile")}
    >
      <span className="bottom-icon">●</span>
      <span>Profile</span>
    </button>
  </nav>
);

export default PatientTokens;
