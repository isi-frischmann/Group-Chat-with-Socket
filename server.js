const path = require('path');

// express
var express = require('express');
var app = express();

// bodyparser - to redirect user information
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// view engine
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// static files
app.use(express.static( path.join(__dirname, "./static") ));

// server
var port = 5000;
const server = app.listen(port)

// session
var session = require('express-session');
app.use(session({
    secret: 'jiha',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

// sockets
const io = require('socket.io')(server);

// count how many user are using the chatroom
var user_count = 0;
var user_list = [];
// the user_list has the socekt_id and the user_name
// {socket_id: 13, user_name: "Tina"}

var message_list = [];

io.on('connection', function(socket){    // send all previous messages to the client side
    socket.emit('message_history', {message_list : message_list});
    
    socket.on('new_user', function(user){
        console.log('socket ID', socket.id);
        console.log('new_user invoked by client - user: ', user);
        const userObject = {
            socket_id: socket.id,
            user_name: user.name
        }
        console.log(userObject);
        user_list.push(userObject);
        user_count = user_list.length;
        console.log(user_list);

        // broadcast is send to all users instead of the user who sent the message
        socket.broadcast.emit('msgthen');
        io.emit('update_user_list', {user_list : user_list})
    });

    socket.on('new_message', function(data){
        console.log(socket.id);
        console.log(data.msg);
        for(var i = 0; i < user_list.length; i++){
            if(user_list[i].socket_id == socket.id){
                user_name = user_list[i].user_name
                msg = data.msg
                var messageObject = { user_name: user_name, msg: msg}
                message_list.push(messageObject);
                break;
            }
        }
        io.emit('receive_message', messageObject);
    })

})

// create routing
app.get('/', function(req, res){
    res.render('index');
})