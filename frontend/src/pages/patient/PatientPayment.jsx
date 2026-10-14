import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import paymentService from "../../services/paymentService";
import tokenService from "../../services/tokenService";

import doctorImage from "../../assets/images/doctor.jpeg";

import "./PatientPayment.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const PatientPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    const tokenId = location.state?.tokenId;

    if (tokenId && tokens.length > 0) {
      const token = tokens.find((item) => item.id === Number(tokenId));

      if (token) {
        setSelectedToken(token);
      }
    }
  }, [location.state, tokens]);

  // Load patient's tokens.
  const loadTokens = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await tokenService.getMyTokens();

      if (response.success) {
        const availableTokens = response.tokens || [];

        setTokens(availableTokens);

        const tokenId = location.state?.tokenId;

        if (tokenId) {
          const token = availableTokens.find(
            (item) => item.id === Number(tokenId),
          );

          if (token) {
            setSelectedToken(token);
          }
        }
      } else {
        setError(response.message || "Unable to load tokens.");
      }
    } catch (error) {
      console.error("Failed to load tokens:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/patient");
        return;
      }

      setError(error.response?.data?.message || "Unable to load tokens.");
    } finally {
      setLoading(false);
    }
  };

  // Generate doctor image URL.
  const getDoctorImage = (doctor) => {
    const photo = doctor?.profileImage || doctor?.User?.photo;

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

  // Open Cashfree checkout.
  const openCashfreeCheckout = async (paymentSessionId) => {
    try {
      if (!paymentSessionId) {
        throw new Error("Payment session ID not received.");
      }

      // Load Cashfree SDK from global window object.
      if (!window.Cashfree) {
        throw new Error("Cashfree SDK is not loaded.");
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Cashfree checkout error:", error);

      setError(error.message || "Unable to open payment checkout.");

      setPaymentLoading(false);
    }
  };

  // Create ₹10 payment order.
  const handlePayment = async () => {
    try {
      if (!selectedToken) {
        setError("Please select a token first.");
        return;
      }

      setPaymentLoading(true);
      setError("");
      setSuccess("");

      const response = await paymentService.createPaymentOrder(
        selectedToken.id,
      );

      if (!response.success) {
        setError(response.message || "Unable to create payment.");

        setPaymentLoading(false);
        return;
      }

      await openCashfreeCheckout(response.paymentSessionId);
    } catch (error) {
      console.error("Payment creation error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment.",
      );

      setPaymentLoading(false);
    }
  };

  // Format token status.
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

      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <main className="patient-payment-page">
        <header className="patient-payment-header">
          <button
            type="button"
            className="payment-back-button"
            onClick={() => navigate("/patient/dashboard")}
          >
            ←
          </button>

          <h1>Payment</h1>

          <div className="payment-header-space"></div>
        </header>

        <section className="patient-payment-content">
          <div className="payment-loading">
            <div className="loading-spinner"></div>

            <p>Loading payment details...</p>
          </div>
        </section>

        <BottomNavigation navigate={navigate} />
      </main>
    );
  }

  return (
    <main className="patient-payment-page">
      {/* Header */}
      <header className="patient-payment-header">
        <button
          type="button"
          className="payment-back-button"
          onClick={() => navigate("/patient/dashboard")}
        >
          ←
        </button>

        <h1>Payment</h1>

        <div className="payment-header-space"></div>
      </header>

      {/* Main content */}
      <section className="patient-payment-content">
        {/* Introduction */}
        <div className="payment-intro">
          <h2>Token Payment</h2>

          <p>Pay ₹10 to confirm your NirogaHub token.</p>
        </div>

        {/* Error */}
        {error && <div className="payment-error">{error}</div>}

        {/* Success */}
        {success && <div className="payment-success">{success}</div>}

        {/* Token selection */}
        {!selectedToken && (
          <section className="payment-token-section">
            <h3>Select Token</h3>

            {tokens.length === 0 ? (
              <div className="payment-empty">
                <div className="payment-empty-icon">🎟️</div>

                <h3>No tokens available</h3>

                <p>Please book a token before making a payment.</p>

                <button
                  type="button"
                  onClick={() => navigate("/patient/clinics")}
                >
                  Find a Clinic
                </button>
              </div>
            ) : (
              <div className="payment-token-list">
                {tokens.map((token) => (
                  <button
                    type="button"
                    key={token.id}
                    className="payment-token-option"
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="payment-token-number">
                      #{token.tokenNumber}
                    </div>

                    <div className="payment-token-info">
                      <strong>{token.Doctor?.User?.name || "Doctor"}</strong>

                      <span>
                        {token.Doctor?.specialization || "General Physician"}
                      </span>
                    </div>

                    <div className="payment-token-status">
                      {getStatusText(token.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Selected token */}
        {selectedToken && (
          <section className="payment-card">
            <div className="payment-doctor">
              <div className="payment-doctor-image">
                <img
                  src={getDoctorImage(selectedToken.Doctor)}
                  alt={selectedToken.Doctor?.User?.name || "Doctor"}
                  onError={(e) => {
                    e.currentTarget.src = doctorImage;
                  }}
                />
              </div>

              <div className="payment-doctor-info">
                <h3>{selectedToken.Doctor?.User?.name || "Doctor"}</h3>

                <p>
                  {selectedToken.Doctor?.specialization || "General Physician"}
                </p>

                {selectedToken.Doctor?.experience != null && (
                  <span>
                    {selectedToken.Doctor.experience} years experience
                  </span>
                )}
              </div>
            </div>

            {/* Token information */}
            <div className="payment-details">
              <div className="payment-detail-row">
                <span>Token Number</span>

                <strong>#{selectedToken.tokenNumber}</strong>
              </div>

              <div className="payment-detail-row">
                <span>Token Type</span>

                <strong>
                  {selectedToken.tokenType === "priority"
                    ? "Priority"
                    : "Normal"}
                </strong>
              </div>

              <div className="payment-detail-row">
                <span>Clinic</span>

                <strong>
                  {selectedToken.Clinic?.name ||
                    selectedToken.Doctor?.clinicName ||
                    "Clinic"}
                </strong>
              </div>

              <div className="payment-detail-row">
                <span>Date</span>

                <strong>{selectedToken.date}</strong>
              </div>
            </div>

            {/* Payment amount */}
            <div className="payment-amount">
              <span>Total Amount</span>

              <strong>₹10</strong>
            </div>

            {/* Sandbox information */}
            <div className="sandbox-notice">
              <strong>Cashfree Sandbox</strong>

              <span>
                This is a test payment. No real money will be charged.
              </span>
            </div>

            {/* Payment button */}
            <button
              type="button"
              className="pay-now-button"
              disabled={paymentLoading}
              onClick={handlePayment}
            >
              {paymentLoading ? "Opening Payment..." : "Pay ₹10"}
            </button>

            {/* Change token */}
            <button
              type="button"
              className="change-token-button"
              onClick={() => setSelectedToken(null)}
            >
              Choose Another Token
            </button>
          </section>
        )}
      </section>

      {/* Bottom navigation */}
      <BottomNavigation navigate={navigate} />
    </main>
  );
};

// Bottom navigation.
const BottomNavigation = ({ navigate }) => {
  return (
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
        className="bottom-nav-item"
        onClick={() => navigate("/patient/tokens")}
      >
        <span className="bottom-icon">🎟️</span>
        <span>My Token</span>
      </button>

      <button
        type="button"
        className="bottom-nav-item active"
        onClick={() => navigate("/patient/payment")}
      >
        <span className="bottom-icon">₹</span>
        <span>Payment</span>
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
};

export default PatientPayment;
