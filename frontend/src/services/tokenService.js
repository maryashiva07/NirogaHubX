import api from "./api";

const tokenService = {
  createToken: async (data) => {
    const response = await api.post("/tokens", data);

    return response.data;
  },

  getMyTokens: async () => {
    const response = await api.get("/tokens/my");

    return response.data;
  },

  getTokenHistory: async () => {
    const response = await api.get("/tokens/history");

    return response.data;
  },

  getDoctorQueue: async () => {
    const response = await api.get("/tokens/queue");

    return response.data;
  },

  callToken: async (tokenId) => {
    const response = await api.patch(`/tokens/${tokenId}/call`);

    return response.data;
  },

  completeToken: async (tokenId) => {
    const response = await api.patch(`/tokens/${tokenId}/complete`);

    return response.data;
  },

  cancelToken: async (tokenId) => {
    const response = await api.patch(`/tokens/${tokenId}/cancel`);

    return response.data;
  },
};

export default tokenService;
