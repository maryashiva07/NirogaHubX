import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import patientRecordService from "../../services/patientRecordService";

import "./PatientHistory.css";

const PatientHistory = () => {
  const navigate = useNavigate();

  const { patientId } = useParams();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response =
          await patientRecordService.getPatientHistory(patientId);

        setHistory(response.history || []);
      } catch (error) {
        console.error("Patient history error:", error);

        setError(
          error.response?.data?.message || "Unable to load patient history.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [patientId]);

  return (
    <div className="patient-history-page">
      <header className="patient-record-header">
        <button onClick={() => navigate(`/doctor/patient/${patientId}`)}>
          ←
        </button>

        <h1>Patient History</h1>
      </header>

      <main className="patient-history-content">
        {loading && <div className="history-message">Loading history...</div>}

        {!loading && error && (
          <div className="history-message error">{error}</div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <span>📋</span>

            <h2>No Visit History</h2>

            <p>This patient has no previous visits with you.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="history-list">
            {history.map((visit) => (
              <article className="history-card" key={visit.id}>
                <div className="history-date">
                  <strong>{visit.date}</strong>

                  <span>Token #{visit.tokenNumber}</span>
                </div>

                <div className="history-details">
                  <div>
                    <span>Status</span>

                    <strong>{visit.status}</strong>
                  </div>

                  <div>
                    <span>Token Type</span>

                    <strong>{visit.tokenType}</strong>
                  </div>

                  <div>
                    <span>Patient Name</span>

                    <strong>{visit.patientName}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientHistory;
