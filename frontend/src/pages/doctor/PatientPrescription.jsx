import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import patientRecordService from "../../services/patientRecordService";

import "./PatientPrescription.css";

const PatientPrescription = () => {
  const navigate = useNavigate();

  const { patientId } = useParams();

  const [prescriptions, setPrescriptions] = useState([]);

  const [diagnosis, setDiagnosis] = useState("");

  const [instructions, setInstructions] = useState("");

  const [followUpDate, setFollowUpDate] = useState("");

  const [notes, setNotes] = useState("");

  const [medicine, setMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const loadPrescriptions = async () => {
    try {
      setLoading(true);

      const response =
        await patientRecordService.getPatientPrescriptions(patientId);

      setPrescriptions(response.prescriptions || []);
    } catch (error) {
      console.error("Prescription error:", error);

      setError(
        error.response?.data?.message || "Unable to load prescriptions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [patientId]);

  const addMedicine = () => {
    if (!medicine.name.trim() || !medicine.dosage.trim()) {
      return;
    }

    setMedicines([...medicines, medicine]);

    setMedicine({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
    });
  };

  const removeMedicine = (index) => {
    setMedicines(
      medicines.filter((_, medicineIndex) => medicineIndex !== index),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await patientRecordService.createPrescription(patientId, {
        diagnosis,
        medicines,
        instructions,
        followUpDate: followUpDate || null,
        notes,
      });

      setDiagnosis("");
      setInstructions("");
      setFollowUpDate("");
      setNotes("");
      setMedicines([]);

      await loadPrescriptions();
    } catch (error) {
      console.error("Create prescription error:", error);

      setError(
        error.response?.data?.message || "Unable to create prescription.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="patient-prescription-page">
      <header className="patient-record-header">
        <button onClick={() => navigate(`/doctor/patient/${patientId}`)}>
          ←
        </button>

        <h1>Prescription</h1>
      </header>

      <main className="prescription-content">
        {/* Create Prescription */}

        <section className="prescription-form-card">
          <h2>New Prescription</h2>

          {error && <div className="prescription-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Diagnosis</label>

            <input
              type="text"
              placeholder="Enter diagnosis"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
            />

            <div className="medicine-heading">
              <h3>Medicines</h3>
            </div>

            <div className="medicine-input-grid">
              <input
                type="text"
                placeholder="Medicine name"
                value={medicine.name}
                onChange={(event) =>
                  setMedicine({
                    ...medicine,
                    name: event.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Dosage"
                value={medicine.dosage}
                onChange={(event) =>
                  setMedicine({
                    ...medicine,
                    dosage: event.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Frequency"
                value={medicine.frequency}
                onChange={(event) =>
                  setMedicine({
                    ...medicine,
                    frequency: event.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Duration"
                value={medicine.duration}
                onChange={(event) =>
                  setMedicine({
                    ...medicine,
                    duration: event.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              className="add-medicine-button"
              onClick={addMedicine}
            >
              + Add Medicine
            </button>

            {medicines.length > 0 && (
              <div className="medicine-list">
                {medicines.map((item, index) => (
                  <div className="medicine-item" key={index}>
                    <div>
                      <strong>{item.name}</strong>

                      <span>
                        {item.dosage}
                        {" • "}
                        {item.frequency}
                        {" • "}
                        {item.duration}
                      </span>
                    </div>

                    <button type="button" onClick={() => removeMedicine(index)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label>Instructions</label>

            <textarea
              placeholder="Enter instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />

            <label>Follow-up Date</label>

            <input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
            />

            <label>Notes</label>

            <textarea
              placeholder="Additional notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />

            <button
              type="submit"
              className="save-prescription-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </form>
        </section>

        {/* Previous Prescriptions */}

        <section className="previous-prescriptions">
          <h2>Previous Prescriptions</h2>

          {loading ? (
            <p>Loading prescriptions...</p>
          ) : prescriptions.length === 0 ? (
            <div className="prescription-empty">
              <span>💊</span>

              <h3>No prescriptions</h3>

              <p>No prescription has been created for this patient yet.</p>
            </div>
          ) : (
            prescriptions.map((prescription) => (
              <article
                className="previous-prescription-card"
                key={prescription.id}
              >
                <div className="prescription-card-header">
                  <strong>
                    {prescription.diagnosis || "General Consultation"}
                  </strong>

                  <span>
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {prescription.medicines?.length > 0 && (
                  <div>
                    <h4>Medicines</h4>

                    {prescription.medicines.map((item, index) => (
                      <div className="previous-medicine" key={index}>
                        <strong>{item.name}</strong>

                        <span>
                          {item.dosage}
                          {" • "}
                          {item.frequency}
                          {" • "}
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {prescription.instructions && (
                  <p>
                    <strong>Instructions:</strong> {prescription.instructions}
                  </p>
                )}

                {prescription.followUpDate && (
                  <p>
                    <strong>Follow-up:</strong> {prescription.followUpDate}
                  </p>
                )}

                {prescription.notes && (
                  <p>
                    <strong>Notes:</strong> {prescription.notes}
                  </p>
                )}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default PatientPrescription;
