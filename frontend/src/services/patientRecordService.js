import api from "./api";

const patientRecordService = {
  getPatientDetails: async (patientId) => {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response.data;
  },

  getPatientHistory: async (patientId) => {
    const response = await api.get(
      `/doctor/patients/${patientId}/history`
    );
    return response.data;
  },

  getPatientPrescriptions: async (patientId) => {
    const response = await api.get(
      `/doctor/patients/${patientId}/prescriptions`
    );
    return response.data;
  },

  createPrescription: async (patientId, prescriptionData) => {
    const response = await api.post(
      `/doctor/patients/${patientId}/prescriptions`,
      prescriptionData
    );
    return response.data;
  },
};

export default patientRecordService;
