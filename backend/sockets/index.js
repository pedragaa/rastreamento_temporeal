const db = require('../models/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('location:update', async (data) => {
      const { entregadorId, latitude, longitude } = data;

      await db.query(
        'INSERT INTO localizacoes (entregador_id, latitude, longitude) VALUES (?, ?, ?)',
        [entregadorId, latitude, longitude]
      );

      // Enviar localização atualizada para todos os gestores conectados
      io.emit('location:gestorUpdate', { entregadorId, latitude, longitude });
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};
