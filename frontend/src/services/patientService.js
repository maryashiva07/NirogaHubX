import api from "./api";

const patientService = {
  getProfile: async () => {
    const response = await api.get("/patients/profile");

    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/patients/profile", data);

    return response.data;
  },

  updatePhoto: async (file) => {
    const formData = new FormData();

    formData.append("photo", file);

    const response = await api.put("/patients/photo", formData);

    return response.data;
  },
};

export default patientService;
