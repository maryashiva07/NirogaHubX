import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import clinicService from "../../services/clinicService";

import "./PatientClinic.css";

const PatientClinic = () => {
  const navigate = useNavigate();

  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClinics();
  }, []);

  // Load all approved doctors' clinics
  const loadClinics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await clinicService.getAllClinics();

      if (response.success) {
        setClinics(response.clinics || []);
      } else {
        setClinics([]);
      }
    } catch (error) {
      console.error("Failed to load clinics:", error);

      setError(error.response?.data?.message || "Unable to load clinics.");

      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter clinics
  const filteredClinics = clinics.filter((clinic) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    const clinicName = clinic.name?.toLowerCase() || "";

    const address = clinic.address?.toLowerCase() || "";

    const location = clinic.location?.toLowerCase() || "";

    const doctorName = clinic.Doctor?.User?.name?.toLowerCase() || "";

    const specialization = clinic.Doctor?.specialization?.toLowerCase() || "";

    return (
      clinicName.includes(searchValue) ||
      address.includes(searchValue) ||
      location.includes(searchValue) ||
      doctorName.includes(searchValue) ||
      specialization.includes(searchValue)
    );
  });

  // Open clinic
  const handleClinicClick = (clinic) => {
    navigate(`/patient/clinic/${clinic.id}`);
  };

  // Generate token for clinic's doctor
  const handleGenerateToken = (event, clinic) => {
    event.stopPropagation();

    const doctorId = clinic.Doctor?.id;

    if (!doctorId) {
      alert("Doctor information is not available.");
      return;
    }

    navigate(`/patient/token/${doctorId}`);
  };

  return (
    <main className="patient-clinic-page">
      {/* Header */}

      <header className="clinic-page-header">
        <button
          type="button"
          className="clinic-back-button"
          onClick={() => navigate("/patient/dashboard")}
        >
          ←
        </button>

        <div>
          <h1>Clinics</h1>

          <p>Find clinics near you</p>
        </div>
      </header>

      {/* Main Content */}

      <section className="clinic-page-content">
        {/* Search */}

        <div className="clinic-search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search clinics, doctors or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Error */}

        {error && <div className="clinic-error">{error}</div>}

        {/* Loading */}

        {loading && (
          <div className="clinic-loading">
            <div className="loading-spinner"></div>

            <p>Finding clinics...</p>
          </div>
        )}

        {/* No clinics */}

        {!loading && !error && filteredClinics.length === 0 && (
          <div className="no-clinics">
            <div className="no-clinics-icon">🏥</div>

            <h2>No clinics available</h2>

            <p>
              {search
                ? "No clinics match your search."
                : "Clinics will appear here once they are available."}
            </p>
          </div>
        )}

        {/* Clinics */}

        {!loading && filteredClinics.length > 0 && (
          <div className="clinic-grid">
            {filteredClinics.map((clinic) => {
              const doctor = clinic.Doctor;

              const doctorName = doctor?.User?.name || "Doctor";

              const specialization =
                doctor?.specialization || "General Physician";

              return (
                <article
                  className="clinic-card"
                  key={clinic.id}
                  onClick={() => handleClinicClick(clinic)}
                >
                  {/* Clinic Icon */}

                  <div className="clinic-icon">🏥</div>

                  {/* Clinic Information */}

                  <div className="clinic-info">
                    <h3>{clinic.name}</h3>

                    <p className="clinic-doctor-name">👨‍⚕️ {doctorName}</p>

                    <p className="clinic-specialization">{specialization}</p>

                    <p>
                      📍{" "}
                      {clinic.address ||
                        clinic.location ||
                        "Address not available"}
                    </p>

                    {clinic.phone && <p>📞 {clinic.phone}</p>}

                    {doctor?.experience != null && (
                      <p>🩺 {doctor.experience} years experience</p>
                    )}

                    {doctor?.consultationFee != null && (
                      <p>💰 ₹{doctor.consultationFee}</p>
                    )}

                    <div className="clinic-card-actions">
                      <button
                        type="button"
                        className="clinic-view-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          if (doctor?.id) {
                            navigate(`/patient/doctor/${doctor.id}`);
                          }
                        }}
                      >
                        View Doctor
                      </button>

                      <button
                        type="button"
                        className="clinic-token-button"
                        onClick={(event) => handleGenerateToken(event, clinic)}
                      >
                        Generate Token
                      </button>
                    </div>
                  </div>

                  <span className="clinic-arrow">→</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom Navigation */}

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
          className="bottom-nav-item active"
          onClick={() => navigate("/patient/clinics")}
        >
          <span className="bottom-icon">🏥</span>

          <span>Clinics</span>
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
    </main>
  );
};

export default PatientClinic;
