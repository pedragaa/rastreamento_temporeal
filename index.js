const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'entregas'
    });

    console.log('✅ Conectado ao banco MySQL');

    io.on('connection', (socket) => {
      console.log('🚚 Cliente conectado via WebSocket');

      socket.on('location:update', async (data) => {
        const { entregadorId, latitude, longitude } = data;

        console.log(`📍 Localização recebida do entregador ${entregadorId}: ${latitude}, ${longitude}`);

        try {
          await db.execute(
            'INSERT INTO localizacoes (entregador_id, latitude, longitude) VALUES (?, ?, ?)',
            [entregadorId, latitude, longitude]
          );

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

            const distancia = Math.sqrt(
              Math.pow(destino.latitude - latitude, 2) +
              Math.pow(destino.longitude - longitude, 2)
            );

            if (distancia < 0.0005) {
              status = 'chegou';
            }
          }

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

    app.get('/', (req, res) => {
      res.send('Servidor rodando com WebSocket!');
    });

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

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.post('/rota', async (req, res) => {
  const { origem, destino } = req.body;

  console.log('🔄 Recebido na rota /rota');
  console.log('📍 Origem:', origem);
  console.log('📍 Destino:', destino);

  if (
    !origem || !destino ||
    origem.latitude == null || origem.longitude == null ||
    destino.latitude == null || destino.longitude == null
  ) {
    console.warn('⚠️ Coordenadas inválidas detectadas');
    return res.status(400).json({ message: 'Coordenadas inválidas' });
  }

  try {
    const bodyData = {
      coordinates: [
        [origem.longitude, origem.latitude],
        [destino.longitude, destino.latitude]
      ]
    };

    console.log('📦 Enviando para OpenRoute:', JSON.stringify(bodyData));

    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf62489e9169b13ab940d9aa43d0b73dfa268a'
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (!data || !data.routes || data.routes.length === 0) {
      console.error('❌ Rota não encontrada na resposta da API:', data);
      return res.status(404).json({ message: 'Rota não encontrada' });
    }

    console.log('✅ Rota recebida com sucesso!');
    res.json(data);
  } catch (error) {
    console.error('🔥 ERRO FATAL AO BUSCAR ROTA:', error);
    res.status(500).json({ message: 'Erro interno ao buscar rota', error: error.message });
  }
});


startServer();
