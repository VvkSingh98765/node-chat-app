const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

//Create the Express application
const app = express()

//Create the HTTP server using Express Appliction
const server = http.createServer(app)

//Connect socket.io to the HTTP server
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//Listen for new connection to Socket.io
io.on('connection', (socket) => {
    console.log('New WebSocket Connection')


    //event handler for messaging
    socket.on('sendMessage', (message, callback) => {

        //get user based on the socket id - which is unique for each client/connection
        const user = getUser(socket.id)


        //proceed if user is defined
        if (user) {

            //remove profanity using thir party bad-words library
            const filter = new Filter()
            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed')
            }

            //emit message only to the room in which our user has been added
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback()

        }

    })

    //event handle for sending locations
    socket.on('sendLocation', (data, callback) => {

        //get user based on the socket id - which is unique for each client/connection
        const user = getUser(socket.id)

        //proceed if user is defined
        if (user) {


            //emitting location only to the room ,where the user has been added
            io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${data.lat},${data.long}`))
            callback()
        }
    })

    //event handler for joining
    socket.on('join', ({ username, room }, callback) => {

        //adding user to the array, by calling function from users.js
        const { user, error } = addUser({ id: socket.id, username, room })


        //in case of error -(duplicate user), return and send an acknowledgment with error
        if (error) {
            return callback(error)
        }

        //on successful add user to the room-(sanitised version of room )
        socket.join(user.room)

        //emit welcome message for the client
        socket.emit('message', generateMessage(`Admin`, `Welcome ${user.username}`))

        //broadcast entry notif to all the user within the room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined this room`))

        //send room data to client side for rendering
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        //callback - without argument=>acknowledgement ,that user has been added successfully to the room
        callback()

    })

    //event handle for disconnecting
    socket.on('disconnect', () => {

        //removing user by using the id.
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`Admin`, `${user.username} has left the room`))

            //send room data to client side for rendering
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }


    })

})



server.listen(port, () => {
    console.log(`Server is up on port: ${port} !!`)
})


