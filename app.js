const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    }
  });

// const corsOptions = {
//     origin: 'http://localhost:5173', 
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// };

// app.use(cors(corsOptions));

const connectedUsers = {};


app.get('/', (req, res) => {
    res.send('Serveur Socket.IO fonctionne');
});


io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');
  // Écouter l'événement de connexion de l'utilisateur
    socket.on('registerUser', (userId, username) => {
        connectedUsers[socket.id] = userId, username; // Associer l'ID de socket à l'ID de l'utilisateur
        // io.emit('userConnected', { userId, socketId: socket.id });
        io.emit('updateUserList', Object.values(connectedUsers)); 
        console.log(connectedUsers);
        
    });

    // Écouter les déconnexions
    socket.on('disconnect', () => {
        const userId = connectedUsers[socket.id];
        delete connectedUsers[socket.id]; // Retirer l'utilisateur de la liste
        io.emit('userDisconnected', { userId, socketId: socket.id });
    });

    // rejoindre room
    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`Utilisateur a rejoint la salle: ${conversationId}`);
        socket.emit('joinedRoom', `Vous avez rejoint la salle ${conversationId}`);
    });

    // ecoute mess
    socket.on('message', ({ conversationId, msg }) => {
        console.log(`Message reçu dans la salle ${conversationId}: ${msg}`);
        io.to(conversationId).emit('message', msg); 
    });

    // gere deconnexion
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
