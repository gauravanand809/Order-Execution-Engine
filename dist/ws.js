"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWs = setupWs;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function setupWs(io) {
    io.on("connection", (socket) => {
        const token = socket.handshake.auth?.token;
        console.log(socket.id);
        let decoded;
        try {
            const result = jsonwebtoken_1.default.verify(token, process.env.AUTH_SECRET || "MeinNahiBatunga");
            if (typeof result === "string") {
                throw new Error("Invalid token payload");
            }
            decoded = result;
            console.log("WS Connected:", socket.id);
        }
        catch (err) {
            return socket.disconnect(true);
        }
        const jobId = decoded.id;
        if (!jobId)
            throw new Error("Missing jobId");
        socket.join(jobId);
        console.log(`Socket ${socket.id} joined room ${jobId}`);
        socket.on("ping", () => {
            socket.emit("pong", "hello from server");
        });
    });
}
//# sourceMappingURL=ws.js.map