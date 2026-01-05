const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ping = require('ping'); // برای تست وضعیت سیستم‌ها

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// لیست سیستم‌هایی که می‌خواهی مانیتور کنی (آی‌پی یا آدرس سایت)
let systems = [
    { id: 1, name: 'اینترنت شرکت', host: '8.8.8.8', status: 'checking' },
    { id: 2, name: 'وب‌سایت اصلی', host: 'google.com', status: 'checking' },
    { id: 3, name: 'سرور داخلی', host: '192.168.1.1', status: 'checking' } 
];

// تابع چک کردن وضعیت
async function checkSystems() {
    for (let sys of systems) {
        let res = await ping.promise.probe(sys.host);
        sys.status = res.alive ? 'online' : 'offline';
    }
    io.emit('status-update', systems); // ارسال وضعیت جدید به همه کاربران
}

// اجرای چک کردن هر 30 ثانیه یکبار
setInterval(checkSystems, 30000);

io.on('connection', (socket) => {
    socket.emit('status-update', systems); // ارسال وضعیت به محض ورود کاربر
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Monitoring Server Started...');
    checkSystems(); // اولین چک بلافاصله بعد از اجرا
});
