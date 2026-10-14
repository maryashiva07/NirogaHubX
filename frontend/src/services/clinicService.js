import api from "./api";

const clinicService = {
  getAllClinics: async () => {
    const response = await api.get("/clinics/all");

    return response.data;
  },

  getMyClinic: async () => {
    const response = await api.get("/clinics/my");

    return response.data;
  },

  createClinic: async (clinicData) => {
    const response = await api.post("/clinics", clinicData);

    return response.data;
  },

  updateClinic: async (clinicId, clinicData) => {
    const response = await api.put(`/clinics/${clinicId}`, clinicData);

    return response.data;
  },

  deleteClinic: async (clinicId) => {
    const response = await api.delete(`/clinics/${clinicId}`);

    return response.data;
  },
};

export default clinicService;
