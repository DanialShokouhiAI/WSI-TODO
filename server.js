const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // استفاده از این کتابخانه به جای پینگ

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// لیست سیستم‌ها (اینجا می‌توانی سایت‌ها یا سرویس‌های شرکت را بگذاری)
let systems = [
    { id: 1, name: 'گوگل (اینترنت)', host: 'https://www.google.com', status: 'checking' },
    { id: 2, name: 'پنل کاربری شرکت', host: 'https://github.com', status: 'checking' },
    { id: 3, name: 'سرویس ایمیل', host: 'https://mail.google.com', status: 'checking' }
];

async function checkSystems() {
    for (let sys of systems) {
        try {
            // یک درخواست سریع برای تست زنده بودن سایت
            await axios.get(sys.host, { timeout: 5000 });
            sys.status = 'online';
        } catch (error) {
            sys.status = 'offline';
        }
    }
    io.emit('status-update', systems);
}

// هر 60 ثانیه یکبار چک کن
setInterval(checkSystems, 60000);

io.on('connection', (socket) => {
    socket.emit('status-update', systems);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Monitoring Server Started with HTTP Check...');
    checkSystems();
});
