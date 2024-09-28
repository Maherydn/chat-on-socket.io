const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Remplacez par l'URL de votre frontend
      methods: ['GET', 'POST'],
      credentials: true // Si vous utilisez des cookies
    }
  });

// Options CORS
const corsOptions = {
    origin: 'http://localhost:5173', // Remplacez par l'URL de votre frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si vous utilisez des cookies
};

// Appliquez le middleware CORS
app.use(cors(corsOptions));

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('Serveur Socket.IO fonctionne');
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    // Rejoindre une room spécifique avec un ID de conversation
    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`Utilisateur a rejoint la salle: ${conversationId}`);
        socket.emit('joinedRoom', `Vous avez rejoint la salle ${conversationId}`);
    });

    // Écouter les messages dans une room spécifique
    socket.on('message', ({ conversationId, msg, sender }) => {
        console.log(`Message reçu dans la salle ${conversationId}: ${msg}`);
        io.to(conversationId).emit('message', sender); // Envoyer le message à la room
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000; // Utilisation de la variable d'environnement pour le port
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
