import type { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";
import type { payload } from "./types.js";

export function setupWs(io: IOServer) {
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    console.log(socket.id);

    let decoded: payload;
    try {
      const result = jwt.verify(
        token,
        process.env.AUTH_SECRET || "MeinNahiBatunga"
      );

      if (typeof result === "string") {
        throw new Error("Invalid token payload");
      }

      decoded = result as payload;

      console.log("WS Connected:", socket.id);
    } catch (err) {
      return socket.disconnect(true);
    }

    const jobId = decoded.id;
    if (!jobId) throw new Error("Missing jobId");

    socket.join(jobId);
    console.log(`Socket ${socket.id} joined room ${jobId}`);

    socket.on("ping", () => {
      socket.emit("pong", "hello from server");
    });
  });
}
