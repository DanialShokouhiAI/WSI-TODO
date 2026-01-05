const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let tasks = []; // ذخیره موقت تسک‌ها در حافظه

io.on('connection', (socket) => {
    // ارسال تسک‌های موجود به کاربر جدید
    socket.emit('init', tasks);

    // دریافت تسک جدید
    socket.on('add-task', (task) => {
        const newTask = { id: Date.now(), text: task, user: 'User' };
        tasks.push(newTask);
        io.emit('task-added', newTask); // باخبر کردن همه کاربران
    });

    // حذف تسک
    socket.on('delete-task', (id) => {
        tasks = tasks.filter(t => t.id !== id);
        io.emit('task-deleted', id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
