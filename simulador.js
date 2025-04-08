const io = require('socket.io-client');
const socket = io('http://localhost:3000');

const entregadorId = 1;

// Ponto de partida
let latitude = -23.55052;
let longitude = -46.633308;

// Ponto de chegada
const destinoLatitude = -23.545;
const destinoLongitude = -46.630;

// Velocidade do deslocamento (quanto maior, mais rápido)
const step = 0.0001;

const intervalo = setInterval(() => {
  // Calcula a diferença
  const deltaLat = destinoLatitude - latitude;
  const deltaLng = destinoLongitude - longitude;

  // Se estiver muito perto do destino, para
  if (Math.abs(deltaLat) < step && Math.abs(deltaLng) < step) {
    console.log('🏁 Entregador chegou ao destino!');
    clearInterval(intervalo);
    return;
  }

  // Movimento gradual
  latitude += deltaLat > 0 ? step : -step;
  longitude += deltaLng > 0 ? step : -step;

  socket.emit('location:update', {
    entregadorId,
    latitude,
    longitude,
  });

  console.log(`📦 Enviando posição: ${latitude}, ${longitude}`);
}, 2000);
