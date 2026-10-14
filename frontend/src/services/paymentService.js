import api from "./api";

const paymentService = {
  createPaymentOrder: async (tokenId) => {
    const response = await api.post("/payments/create-order", {
      tokenId,
    });

    return response.data;
  },

  verifyPayment: async (orderId) => {
    const response = await api.get(`/payments/${orderId}/verify`);

    return response.data;
  },

  getPayment: async (orderId) => {
    const response = await api.get(`/payments/${orderId}`);

    return response.data;
  },
};

export default paymentService;
