const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_ride", async ({ rideId, userId, userName }) => {
      socket.join(`ride_${rideId}`);
      console.log(`${userName} joined ride ${rideId}`);
      
      try {
        const messages = await prisma.rideMessage.findMany({
          where: { rideId: parseInt(rideId) },
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 50
        });

        socket.emit("previous_messages", messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    });

    socket.on("send_message", async ({ rideId, userId, message }) => {
      try {
        const newMessage = await prisma.rideMessage.create({
          data: {
            rideId: parseInt(rideId),
            userId: parseInt(userId),
            message: message
          },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        });

        io.to(`ride_${rideId}`).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("leave_ride", ({ rideId, userName }) => {
      socket.leave(`ride_${rideId}`);
      console.log(`${userName} left ride ${rideId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = setupSocketIO;
