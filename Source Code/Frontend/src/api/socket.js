import { io } from 'socket.io-client';

const HOST = "http://localhost:3000";
const token = localStorage.getItem("accessToken");

const authIO = io(`${HOST}/secure`, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    transports: ['websocket'],
    auth: {
        token: token
    }
});

authIO.on('connect', () => {
    console.log("[authIO] connected to server!")
})

const publicIO = io(`${HOST}/public`, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    transports: ['websocket'],
})

publicIO.on('connect', () => {
    console.log("[publicIO] connected to server!")
})

export {
    authIO,
    publicIO
}