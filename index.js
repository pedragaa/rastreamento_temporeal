const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // MySQL conexão
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'entregas'
    });

    console.log('✅ Conectado ao banco MySQL');

    // Socket.io listener
    io.on('connection', (socket) => {
      console.log('🚚 Cliente conectado via WebSocket');

      socket.on('location:update', async (data) => {
        const { entregadorId, latitude, longitude } = data;

        console.log(`📍 Localização recebida do entregador ${entregadorId}: ${latitude}, ${longitude}`);

        try {
          // Salva no banco
          await db.execute(
            'INSERT INTO localizacoes (entregador_id, latitude, longitude) VALUES (?, ?, ?)',
            [entregadorId, latitude, longitude]
          );

          // Busca a última viagem do entregador
          const [viagens] = await db.execute(
            'SELECT ponto_inicio_lat, ponto_inicio_lng, ponto_fim_lat, ponto_fim_lng FROM viagens WHERE entregador_id = ? ORDER BY id DESC LIMIT 1',
            [entregadorId]
          );

          let status = 'em rota';
          let origem = null;
          let destino = null;

          if (viagens.length > 0) {
            const viagem = viagens[0];
            origem = {
              latitude: parseFloat(viagem.ponto_inicio_lat),
              longitude: parseFloat(viagem.ponto_inicio_lng)
            };
            destino = {
              latitude: parseFloat(viagem.ponto_fim_lat),
              longitude: parseFloat(viagem.ponto_fim_lng)
            };

            // Cálculo simples de distância
            const distancia = Math.sqrt(
              Math.pow(destino.latitude - latitude, 2) +
              Math.pow(destino.longitude - longitude, 2)
            );

            // Define status como "chegou" se a distância for pequena
            if (distancia < 0.0005) {
              status = 'chegou';
            }
          }

          // Emite para o gestor
          io.emit('location:gestorUpdate', {
            entregadorId,
            latitude,
            longitude,
            status,
            origem,
            destino
          });

          console.log(`📦 Emitido status "${status}" para entregador ${entregadorId}`);
        } catch (err) {
          console.error('❌ Erro ao salvar no banco ou emitir status:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
      });
    });

    // Teste HTTP simples
    app.get('/', (req, res) => {
      res.send('Servidor rodando com WebSocket!');
    });

    // Rota para buscar viagem pelo entregador
    app.get('/viagem/:entregadorId', async (req, res) => {
      const { entregadorId } = req.params;

      try {
        const [rows] = await db.execute(
          'SELECT * FROM viagens WHERE entregador_id = ? ORDER BY id DESC LIMIT 1',
          [entregadorId]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Viagem não encontrada' });
        }

        res.json(rows[0]);
      } catch (err) {
        console.error('❌ Erro ao buscar viagem:', err);
        res.status(500).json({ message: 'Erro interno' });
      }
    });

    server.listen(3000, () => {
      console.log('🚀 Servidor rodando em http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ Erro ao conectar no banco MySQL:', err);
  }
}

// Iniciar tudo
startServer();
