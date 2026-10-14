import api from "./api";

const authService = {
  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);

    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
