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

app.get('/', (req, res) => {
    res.send('Serveur Socket.IO fonctionne');
});


io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

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
