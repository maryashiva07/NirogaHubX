const registerTokenSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinQueue", ({ doctorId, clinicId } = {}) => {
      if (!doctorId || !clinicId) {
        return;
      }

      const room = `queue:${doctorId}:${clinicId}`;

      socket.join(room);

      console.log(`Socket ${socket.id} joined ${room}`);
    });

    // Leave a particular doctor's clinic queue.
    socket.on("leaveQueue", ({ doctorId, clinicId } = {}) => {
      if (!doctorId || !clinicId) {
        return;
      }

      const room = `queue:${doctorId}:${clinicId}`;

      socket.leave(room);

      console.log(`Socket ${socket.id} left ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerTokenSocket;
