import api from "./api";

const doctorService = {
  getAllDoctors: async () => {
    const response = await api.get("/doctors/all");
    return response.data;
  },

  getDoctorById: async (doctorId) => {
    const response = await api.get("/doctors/all");

    const doctors = response.data?.doctors || [];

    const doctor = doctors.find((item) => String(item.id) === String(doctorId));

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return {
      success: true,
      doctor,
    };
  },

  getProfile: async () => {
    const response = await api.get("/doctors/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/doctors/profile", data);
    return response.data;
  },

  updatePhoto: async (formData) => {
    const response = await api.put("/doctors/photo", formData);
    return response.data;
  },

  updateAvailability: async (data) => {
    const response = await api.put("/doctors/availability", data);
    return response.data;
  },
};

export default doctorService;
