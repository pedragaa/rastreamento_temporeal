const db = require('../models/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('viagem:criar', async (data) => {
      const {
        entregadorId,
        ponto_inicio_lat,
        ponto_inicio_lng,
        ponto_fim_lat,
        ponto_fim_lng
      } = data;
    
      try {
        await db.query(`
          INSERT INTO viagens (
            entregador_id,
            latitude_partida,
            longitude_partida,
            latitude_destino,
            longitude_destino,
            status
          ) VALUES (?, ?, ?, ?, ?, 'em rota')
        `, [
          entregadorId,
          ponto_inicio_lat,
          ponto_inicio_lng,
          ponto_fim_lat,
          ponto_fim_lng
        ]);
    
        console.log(`🟢 Viagem criada para entregador ${entregadorId}`);
        socket.emit('viagem:criada', { message: 'Viagem criada com sucesso!' });
    
      } catch (error) {
        console.error('❌ Erro ao criar viagem:', error);
        socket.emit('viagem:erro', { error: 'Erro ao criar viagem.' });
      }
    });

    // 🔄 Atualização de localização em tempo real
    socket.on('location:update', async (data) => {
      const { entregadorId, latitude, longitude } = data;

      try {
        // Salva a nova localização
        await db.query(
          'INSERT INTO localizacoes (entregador_id, latitude, longitude) VALUES (?, ?, ?)',
          [entregadorId, latitude, longitude]
        );

        // Busca a última viagem ativa (em rota)
        const [viagem] = await db.query(`
          SELECT 
            ponto_inicio_lat, ponto_inicio_lng, 
            ponto_fim_lat, ponto_fim_lng, 
            status
          FROM viagens
          WHERE entregador_id = ? AND status = 'em rota'
          ORDER BY id DESC
          LIMIT 1
        `, [entregadorId]);

        if (!viagem || viagem.length === 0) {
          console.warn(`Nenhuma viagem "em rota" encontrada para entregador ${entregadorId}`);
          return;
        }

        const origem = viagem[0].ponto_inicio_lat !== null && viagem[0].ponto_inicio_lng !== null
          ? { latitude: viagem[0].ponto_inicio_lat, longitude: viagem[0].ponto_inicio_lng }
          : null;

        const destino = viagem[0].ponto_fim_lat !== null && viagem[0].ponto_fim_lng !== null
          ? { latitude: viagem[0].ponto_fim_lat, longitude: viagem[0].ponto_fim_lng }
          : null;

        // Envia para todos os gestores conectados
        io.emit('location:gestorUpdate', {
          entregadorId,
          localizacaoAtual: { latitude, longitude },
          origem,
          destino,
          status: viagem[0].status
        });

      } catch (err) {
        console.error('Erro ao processar localização:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};
