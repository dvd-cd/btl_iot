import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config'
import http from 'http';

import dbConnect from './config/dbConnect.js';
import { init as initSocket } from './config/socket.js';
import api from './routers/index.js';

import subcribeBroker from './mqttCli/subcriber.js';

const app = express();
app.use(express.json());
app.use(cors());

// connect to database
dbConnect();

// socket.io
const server = http.createServer(app);
initSocket(server);

// mqtt connect
import './config/mqtt.js';
subcribeBroker();

app.get('/health', (req, res) => {
    res.send("<div style='display: flex; justify-content: center; align-items: center; height: 100%'><h1 style='font-size: 48px; color: darkred'>Server is running...</h1></div>")
});
app.get('/', (req, res) => {
    res.send("<div style='display: flex; justify-content: center; align-items: center; height: 100%'><h1 style='font-size: 48px; color: darkred'>Welcome to Smartlock server</h1></div>")
});

app.use('/api', api);

// app.use('/uploads', express.static(path.join(import.meta.dirname, '../../uploads')))

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});