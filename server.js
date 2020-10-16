const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//set the static folder into backend
app.use(express.static(path.join(__dirname, "public")));

const botName = 'MyChatRoom'
//Run when clients connects
io.on('connection', socket => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room);
        //welcome current users
        socket.emit('message', formatMessage(botName, ' <b>Welcome to MyChatRoom!</b>'));
        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the Chat`))

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });


    //listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    });
    //it runs when clients disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {

            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
});

const PORT = 3000 || process.env.PORT;


server.listen(PORT, () => console.log(`server is running on ${PORT}`));