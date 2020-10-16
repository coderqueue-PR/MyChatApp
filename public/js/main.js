//This is the Frontend JavaScript Code

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get Username and room from Url
const {username,room} = Qs.parse(location.search , {
    ignoreQueryPrefix : true
});
console.log(username , room)

const socket = io();

//join chatroom
socket.emit('joinRoom' , {username , room});


// Get Room and Users
socket.on('roomUsers' , ({room , users})=>{
    outputRoomName(room);
    outputUsers(users);
});


//message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    //scroll down message bar
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message Submit

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message test    
    const msg = e.target.elements.msg.value

    //emit message to the server
    socket.emit('chatMessage', msg)

    //clear inputs
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output message to dom
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom
function outputRoomName(room){
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}

