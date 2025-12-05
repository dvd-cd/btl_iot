import { Server } from "socket.io";

import jwt from "jsonwebtoken";

let authIO, publicIO, io;

const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e6, //1mb
    });

    // ================================== 
    // auth io
    // localhost:3000/secure
    // ==================================
    
    authIO = io.of('/secure');
    authIO.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("token missing"));
            }

            // verify
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return next(new Error("invalid token"));
            }

            socket.userId = decoded.id;
            next();
        } catch (error) {
            return next(new Error("socket.io handshake error: " + error.message));
        }
    });
    // handle client connect
    authIO.on('connection', (socket) => {
        console.log('[socket.js] New client connected to #authIO:', socket.id);

        const userId = socket.userId;
        console.log(`client ${socket.id} join into room ${socket.userId}`)
        if (userId) socket.join(userId);

        socket.on('disconnect', () => {
            console.log('[socket.js] Client disconnected #authIO:', socket.id);
            // socket.leaveAll();
        });
    });
    
    // ==================================
    // public io
    // localhost:3000/public
    // ==================================
    publicIO = io.of('/public');
    publicIO.on('connection', (socket) => {
        console.log('[socket.js] New client connected to #publicIO:', socket.id);

        socket.on('disconnect', () => {
            console.log('[socket.js] Client disconnected #publicIO:', socket.id);
            // socket.leaveAll();
        });
    });
}

// const getIO = () => {
//     if (!io) {
//         throw new Error("[socket.js] Socket.io not initialized!");
//     }
//     return io;
// }

const getAuthIO = () => {
    if (!authIO) {
        throw new Error("[socket.js] #authIO not initialized!");
    }
    return authIO;
}
const getPublicIO = () => {
    if (!publicIO) {
        throw new Error("[socket.js] #publicIO not initialized!");
    }
    return publicIO;
}

export { init, getAuthIO, getPublicIO };