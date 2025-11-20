import type { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";

export function setupWs(io: IOServer) {
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    
    try{
    jwt.verify(token, process.env.AUTH_SECRET || "MeinNahiBatunga");
    console.log("WS Connected:", socket.id);
    }
    catch(err){
        return socket.disconnect(true);
    }


    socket.on("ping", () => {
      socket.emit("pong", "hello from server");
    });
  });
}
