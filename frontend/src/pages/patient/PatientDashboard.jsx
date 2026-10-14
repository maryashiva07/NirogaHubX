import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import doctorService from "../../services/doctorService";

import doctorImage from "../../assets/images/doctor.jpeg";
import patientImage from "../../assets/images/patient.png";

import "./PatientDashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const DOCTORS_PER_PAGE = 6;

const PatientDashboard = () => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadPatient();
    loadDoctors();
  }, []);

  const loadPatient = async () => {
    try {
      setLoadingPatient(true);

      const response = await authService.getMe();

      if (response.success) {
        setPatient(response.user);
      }
    } catch (error) {
      console.error("Failed to load patient:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/patient/dashboard");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load patient information.",
      );
    } finally {
      setLoadingPatient(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);

      const response = await doctorService.getAllDoctors();

      if (response.success) {
        setDoctors(response.doctors || []);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);

      setError(error.response?.data?.message || "Unable to load doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const getPatientImage = (photo) => {
    if (!photo) {
      return patientImage;
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

  const getDoctorImage = (doctor) => {
    const photo = doctor.profileImage || doctor.User?.photo;

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

  const filteredDoctors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const doctorName = doctor.User?.name?.toLowerCase() || "";

      const specialization = doctor.specialization?.toLowerCase() || "";

      const clinicName = doctor.clinicName?.toLowerCase() || "";

      const address = doctor.address?.toLowerCase() || "";

      return (
        doctorName.includes(searchValue) ||
        specialization.includes(searchValue) ||
        clinicName.includes(searchValue) ||
        address.includes(searchValue)
      );
    });
  }, [doctors, search]);

  const totalPages = Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE);

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * DOCTORS_PER_PAGE;

    const endIndex = startIndex + DOCTORS_PER_PAGE;

    return filteredDoctors.slice(startIndex, endIndex);
  }, [filteredDoctors, currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);

    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDoctorClick = (doctor) => {
    navigate(`/patient/doctor/${doctor.id}`);
  };

  const handleDoctorImageClick = (event, doctor) => {
    event.stopPropagation();

    navigate(`/patient/doctor/${doctor.id}`);
  };

  const handleViewDoctor = (event, doctor) => {
    event.stopPropagation();

    navigate(`/patient/doctor/${doctor.id}`);
  };

  const handleGenerateToken = (event, doctor) => {
    event.stopPropagation();

    navigate(`/patient/token/${doctor.id}`);
  };

  const handleLogout = () => {
    authService.logout();

    navigate("/patient");
  };

  const patientPhoto = getPatientImage(patient?.photo);

  return (
    <main className="patient-home">
      <header className="patient-header">
        <div className="patient-brand">
          <div className="patient-brand-avatar">
            <img
              src={patientPhoto}
              alt="Patient"
              onError={(e) => {
                e.currentTarget.src = patientImage;
              }}
            />
          </div>

          <h1>NirogaHub</h1>
        </div>

        <div className="patient-greeting">
          {loadingPatient ? (
            <span>Hi...</span>
          ) : (
            <span>Hi, {patient?.name || "Patient"}!</span>
          )}
        </div>
      </header>

      <section className="patient-main">
        {/* Error */}

        {error && <div className="dashboard-error">{error}</div>}

        <div className="clinic-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Find Your Clinic..."
            value={search}
            onChange={handleSearchChange}
          />

          <button
            type="button"
            className="mic-button"
            aria-label="Voice search"
          >
            ♫
          </button>
        </div>

        <section className="patient-actions">
          <button
            type="button"
            className="patient-action token"
            onClick={() => navigate("/patient/tokens")}
          >
            <div className="action-emoji">🎟️</div>

            <span>My Token</span>
          </button>

          <button
            type="button"
            className="patient-action payment"
            onClick={() => navigate("/patient/payment")}
          >
            <div className="qr-icon">▦</div>

            <span>Payment</span>
          </button>

          <button
            type="button"
            className="patient-action history"
            onClick={() => navigate("/patient/history")}
          >
            <div className="action-emoji">📋</div>

            <span>History</span>
          </button>

          <button
            type="button"
            className="patient-action about"
            onClick={() => navigate("/about")}
          >
            <div className="info-icon">i</div>

            <span>About Us</span>
          </button>
        </section>

        <section className="nearby-doctors">
          {/* Section Heading */}

          <div className="section-heading">
            <div>
              <h2>Nearby Doctors</h2>

              <p className="doctor-count">
                {loadingDoctors
                  ? "Loading doctors..."
                  : `${filteredDoctors.length} doctors available`}
              </p>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() => navigate("/patient/doctors")}
            >
              View All
            </button>
          </div>

          {loadingDoctors && (
            <div className="doctor-loading">
              <div className="loading-spinner"></div>

              <p>Finding doctors...</p>
            </div>
          )}

          {!loadingDoctors && filteredDoctors.length === 0 && (
            <div className="no-doctors">
              <div className="no-doctors-icon">🩺</div>

              <h3>No doctors found</h3>

              <p>Try searching with another doctor name or specialization.</p>
            </div>
          )}

          {!loadingDoctors && filteredDoctors.length > 0 && (
            <>
              <div className="doctor-grid">
                {paginatedDoctors.map((doctor) => (
                  <article
                    className="doctor-card"
                    key={doctor.id}
                    onClick={() => handleDoctorClick(doctor)}
                  >
                    {/* Doctor Image */}

                    <div
                      className="doctor-image-wrapper"
                      onClick={(event) => handleDoctorImageClick(event, doctor)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          handleDoctorImageClick(event, doctor);
                        }
                      }}
                    >
                      <img
                        src={getDoctorImage(doctor)}
                        alt={doctor.User?.name || "Doctor"}
                        className="nearby-doctor-image"
                        onError={(e) => {
                          e.currentTarget.src = doctorImage;
                        }}
                      />
                    </div>

                    {/* Doctor Info */}

                    <div className="doctor-info">
                      <h3>Dr. {doctor.User?.name || "Doctor"}</h3>

                      <p>{doctor.specialization || "General Physician"}</p>

                      {doctor.experience != null && (
                        <span className="doctor-experience">
                          {doctor.experience} years experience
                        </span>
                      )}

                      {doctor.clinicName && (
                        <span className="doctor-clinic">
                          🏥 {doctor.clinicName}
                        </span>
                      )}

                      {/* Doctor Actions */}

                      <div className="doctor-card-actions">
                        <button
                          type="button"
                          className="doctor-view-button"
                          onClick={(event) => handleViewDoctor(event, doctor)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="doctor-token-button"
                          onClick={(event) =>
                            handleGenerateToken(event, doctor)
                          }
                        >
                          Generate Token
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages >= 1 && (
                <div className="doctor-pagination">
                  {/* Previous */}

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={handlePreviousPage}
                    aria-label="Previous page"
                  >
                    ←
                  </button>

                  {/* Page Numbers */}

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-button ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>

      <nav className="patient-bottom-nav">
        <button
          type="button"
          className="bottom-nav-item active"
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
          onClick={() => navigate("/patient/profile")}
        >
          <span className="bottom-icon">●</span>

          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
};

export default PatientDashboard;
