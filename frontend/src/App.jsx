import { Routes, Route, Navigate } from "react-router-dom";

import RoleSelection from "./pages/Landing/RoleSelection";

import PatientAuth from "./pages/patient/PatientAuth";
import DoctorAuth from "./pages/doctor/DoctorAuth";

//Patient Dashboard

import PatientDashboard from "./pages/patient/PatientDashboard";

import PatientHome from "./pages/patient/PatientHome";
import PatientClinic from "./pages/patient/PatientClinic";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientEditProfile from "./pages/patient/PatientEditProfile";
import PatientTokens from "./pages/patient/PatientTokens";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientPayment from "./pages/patient/PatientPayment"
import AboutUs from "./pages/patient/AboutUs";
import PatientTokenForm from "./pages/PatientTokenForm/PatientTokenForm";
import PatientPaymentSuccess from "./pages/PatientPaymentSuccess/PatientPaymentSuccess";
import DoctorProfile from "./pages/patient/DoctorProfile";

//Doctor Dashboard

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DDoctorProfile from "./pages/doctor/DoctorProfile";
import EditProfile from "./pages/doctor/EditProfile";
import TodayPatients from "./pages/doctor/TodayPatients";
import CompletedPatients from "./pages/doctor/CompletedPatients";
import PendingPatients from "./pages/doctor/PendingPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointment";
import PatientView from "./pages/doctor/PatientView";
import PatientDocHistory from "./pages/doctor/PatientDocHistory";
import PatientPrescription from "./pages/doctor/PatientPrescription";

function App() {
  return (
    <Routes>
      <Route path="/patient/dashboard" element={<PatientHome />} />

      <Route path="/patient/clinics" element={<PatientClinic />} />

      <Route path="/patient/profile" element={<PatientProfile />} />

      <Route path="/patient/edit-profile" element={<PatientEditProfile />} />

      <Route path="/patient/tokens" element={<PatientTokens />} />

      <Route path="/patient/payment" element={<PatientPayment />} />

      <Route path="/patient/history" element={<PatientHistory />} />

      <Route path="/about" element={<AboutUs />} />

      <Route path="/patient/token/:doctorId" element={<PatientTokenForm />} />

      <Route
        path="/patient/payment/success"
        element={<PatientPaymentSuccess />}
      />

      <Route path="/patient/doctor/:doctorId" element={<DoctorProfile />} />

      {/* Landing / Role Selection */}
      <Route path="/" element={<RoleSelection />} />

      {/* Patient */}
      <Route path="/patient" element={<PatientAuth />} />

      <Route path="/patient/PatientDashboard" element={<PatientDashboard />} />

      {/* Doctor */}
      <Route path="/doctor" element={<DoctorAuth />} />

      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/profile" element={<DDoctorProfile />} />

      <Route path="/doctor/profile/edit" element={<EditProfile />} />

      <Route path="/doctor/today-patients" element={<TodayPatients />} />

      <Route path="/doctor/appointments" element={<DoctorAppointments />} />

      <Route path="/doctor/pending" element={<PendingPatients />} />

      <Route path="/doctor/completed" element={<CompletedPatients />} />

      <Route path="/doctor/patient/:patientId" element={<PatientView />} />

      <Route
        path="/doctor/patient/:patientId/history"
        element={<PatientDocHistory />}
      />

      <Route
        path="/doctor/patient/:patientId/prescription"
        element={<PatientPrescription />}
      />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
