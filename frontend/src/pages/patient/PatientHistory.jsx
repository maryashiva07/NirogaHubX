import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import tokenService from "../../services/tokenService";

import doctorImage from "../../assets/images/doctor.jpeg";

import "./PatientHistory.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await tokenService.getTokenHistory();

      setHistory(response.tokens || []);
    } catch (error) {
      console.error("History loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/patient");
        return;
      }

      setError(error.response?.data?.message || "Unable to load your history");
    } finally {
      setLoading(false);
    }
  };

  const getDoctor = (token) => {
    return token?.Doctor?.User;
  };

  const getDoctorImage = (token) => {
    const doctor = getDoctor(token);

    if (!doctor?.photo) {
      return doctorImage;
    }

    if (doctor.photo.startsWith("http")) {
      return doctor.photo;
    }

    return `${API_BASE_URL}${doctor.photo}`;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatTokenType = (type) => {
    if (!type) return "Normal";

    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleViewToken = (token) => {
    navigate("/patient/tokens", {
      state: {
        tokenId: token.id,
      },
    });
  };

  return (
    <div className="patient-history-page">
      <header className="patient-history-header">
        <button
          className="history-back-button"
          onClick={() => navigate("/patient/dashboard")}
        >
          ←
        </button>

        <h1>History</h1>

        <div className="history-header-space"></div>
      </header>

      <main className="patient-history-content">
        <div className="history-heading">
          <div>
            <h2>Appointment History</h2>
            <p>View your previous appointments and tokens.</p>
          </div>

          <div className="history-count">{history.length}</div>
        </div>

        {loading && (
          <div className="history-loading">
            <div className="history-spinner"></div>
            <p>Loading your history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="history-error">
            <div className="history-error-icon">!</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button className="history-retry-button" onClick={loadHistory}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <div className="history-empty-icon">🩺</div>

            <h3>No history yet</h3>

            <p>Your completed and cancelled appointments will appear here.</p>

            <button
              className="history-book-button"
              onClick={() => navigate("/patient/dashboard")}
            >
              Find a Doctor
            </button>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="history-list">
            {history.map((token) => {
              const doctor = getDoctor(token);

              return (
                <div className="history-card" key={token.id}>
                  <div className="history-card-top">
                    <div className="history-doctor">
                      <img
                        src={getDoctorImage(token)}
                        alt="Doctor"
                        className="history-doctor-image"
                        onError={(event) => {
                          event.currentTarget.src = doctorImage;
                        }}
                      />

                      <div className="history-doctor-info">
                        <h3>Dr. {doctor?.name || "Doctor"}</h3>

                        <p>
                          {token.Doctor?.specialization || "General Physician"}
                        </p>
                      </div>
                    </div>

                    <span className={`history-status ${token.status}`}>
                      {formatStatus(token.status)}
                    </span>
                  </div>

                  <div className="history-divider"></div>

                  <div className="history-details">
                    <div className="history-detail">
                      <span className="history-detail-label">Token</span>

                      <strong>#{token.tokenNumber}</strong>
                    </div>

                    <div className="history-detail">
                      <span className="history-detail-label">Date</span>

                      <strong>{formatDate(token.date)}</strong>
                    </div>

                    <div className="history-detail">
                      <span className="history-detail-label">Type</span>

                      <strong>{formatTokenType(token.tokenType)}</strong>
                    </div>
                  </div>

                  <div className="history-clinic">
                    <span className="history-clinic-icon">🏥</span>

                    <div>
                      <strong>
                        {token.Clinic?.name ||
                          token.Doctor?.clinicName ||
                          "Clinic"}
                      </strong>

                      <p>{token.Clinic?.address || "Address unavailable"}</p>
                    </div>
                  </div>

                  <button
                    className="history-view-button"
                    onClick={() => handleViewToken(token)}
                  >
                    View Token
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <nav className="patient-history-bottom-nav">
        <button onClick={() => navigate("/patient")}>
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button onClick={() => navigate("/patient/tokens")}>
          <span>🎫</span>
          <small>Tokens</small>
        </button>

        <button className="active">
          <span>🕘</span>
          <small>History</small>
        </button>

        <button onClick={() => navigate("/patient/profile")}>
          <span>◯</span>
          <small>Profile</small>
        </button>
      </nav>
    </div>
  );
};

export default PatientHistory;
