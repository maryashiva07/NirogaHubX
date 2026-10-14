import { useNavigate } from "react-router-dom";
import RoleCard from "../../components/common/RoleCard";

import heroDoctor from "../../assets/images/hero-doctor.jpeg";

import "./RoleSection.css";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handlePatient = () => {
    navigate("/patient");
  };

  const handleDoctor = () => {
    navigate("/doctor");
  };

  return (
    <main className="role-page">
      <div className="role-page-inner">
        {/* BRAND */}
        <header className="brand">
          <div className="heart-logo">
            <span>♥</span>
            <div className="heartbeat">〰</div>
          </div>

          <h1>NirogaHub</h1>

          <p>Better Health. Closer to You.</p>
        </header>

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-bg"></div>

          <img
            src={heroDoctor}
            alt="NirogaHub Healthcare"
            className="hero-doctor"
          />
        </section>

        {/* WELCOME */}
        <section className="welcome">
          <h2>Welcome to NirogaHub!</h2>

          <p>Choose how you want to continue</p>
        </section>

        {/* ROLES */}
        <section className="roles">
          <RoleCard
            type="patient"
            title="I'm a Patient"
            description="Book appointments, consult doctors, view history and more."
            buttonText="Continue as Patient"
            onClick={handlePatient}
          />

          <RoleCard
            type="doctor"
            title="I'm a Doctor"
            description="Manage your patients, view appointments and track history."
            buttonText="Continue as Doctor"
            onClick={handleDoctor}
          />
        </section>

        {/* FOOTER */}
        <footer className="priority">
          <span className="priority-line"></span>

          <div className="priority-content">
            <div className="shield">✓</div>

            <span>Your Health, Our Priority</span>
          </div>

          <span className="priority-line"></span>
        </footer>
      </div>

      {/* BOTTOM DECORATION */}
      <div className="bottom-waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
      </div>
    </main>
  );
};

export default RoleSelection;
