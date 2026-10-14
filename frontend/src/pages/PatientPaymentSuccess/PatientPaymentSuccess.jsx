import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import paymentService from "../../services/paymentService";

import "./PatientPaymentSuccess.css";

const PatientPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying your payment...");

  const [token, setToken] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const orderId = searchParams.get("order_id");

      if (!orderId) {
        setStatus("failed");
        setMessage("Payment order ID was not found.");
        return;
      }

      try {
        const response = await paymentService.verifyPayment(orderId);

        if (response.success && response.paymentStatus === "success") {
          setToken(response.token);
          setStatus("success");
          setMessage("Payment successful. Your token has been generated.");
        } else if (response.paymentStatus === "pending") {
          setStatus("pending");
          setMessage("Payment is still being processed.");
        } else {
          setStatus("failed");
          setMessage("Payment was not successful.");
        }
      } catch (error) {
        console.error(error);

        setStatus("failed");

        setMessage(
          error.response?.data?.message || "Unable to verify payment.",
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        {status === "checking" && (
          <>
            <div className="payment-icon">⏳</div>

            <h1>Verifying Payment</h1>

            <p>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="payment-icon success">✓</div>

            <h1>Token Generated</h1>

            <p>{message}</p>

            {token && (
              <div className="generated-token">
                <span>Your Token Number</span>

                <strong>{token.tokenNumber}</strong>

                <small>Date: {token.date}</small>
              </div>
            )}

            <button onClick={() => navigate("/patient/tokens")}>
              View My Token
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="payment-icon">⏳</div>

            <h1>Payment Pending</h1>

            <p>{message}</p>

            <button onClick={() => navigate("/patient/payment")}>
              Go to Payments
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="payment-icon failed">!</div>

            <h1>Payment Failed</h1>

            <p>{message}</p>

            <button onClick={() => navigate(-1)}>Try Again</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientPaymentSuccess;
