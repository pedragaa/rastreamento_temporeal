import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícones personalizados
const iconeMotorista1 = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/194/194933.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const iconeMotorista2 = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/147/147144.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const iconePartida = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const iconeDestino = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Hook para mover o motorista
const useMotoristaEmMovimento = (rota, delay = 500) => {
  const [posicaoAtual, setPosicaoAtual] = useState(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!rota || rota.length === 0) return;

    const interval = setInterval(() => {
      setPosicaoAtual(rota[indexRef.current]);
      indexRef.current = (indexRef.current + 1) % rota.length;
    }, delay);

    return () => clearInterval(interval);
  }, [rota, delay]);

  return posicaoAtual;
};

const MapaEntregadores = () => {
  const [rotas, setRotas] = useState([[], []]);

  const entregadores = [
    {
      id: 1,
      origem: { latitude: -23.55, longitude: -46.63 },
      destino: { latitude: -23.57, longitude: -46.65 },
      icone: iconeMotorista1,
    },
    {
      id: 2,
      origem: { latitude: -23.53, longitude: -46.61 },
      destino: { latitude: -23.56, longitude: -46.60 },
      icone: iconeMotorista2,
    },
  ];

  useEffect(() => {
    const buscarTodasRotas = async () => {
      const novasRotas = [];

      for (const entregador of entregadores) {
        try {
          const response = await fetch('http://localhost:3000/rota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origem: entregador.origem,
              destino: entregador.destino,
            }),
          });

          const data = await response.json();
          const geometry = data.routes[0].geometry;
          const coordenadas = polyline.decode(geometry);
          novasRotas.push(coordenadas);
        } catch (err) {
          console.error('Erro ao buscar rota:', err);
          novasRotas.push([]);
        }
      }

      setRotas(novasRotas);
    };

    buscarTodasRotas();
  }, []);

  const posicoes = rotas.map((rota) => useMotoristaEmMovimento(rota, 400));

  return (
    <MapContainer center={[-23.55, -46.63]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {entregadores.map((entregador, i) => (
        <React.Fragment key={entregador.id}>
          <Marker
            position={[entregador.origem.latitude, entregador.origem.longitude]}
            icon={iconePartida}
          />
          <Marker
            position={[entregador.destino.latitude, entregador.destino.longitude]}
            icon={iconeDestino}
          />
          {rotas[i].length > 0 && <Polyline positions={rotas[i]} color="blue" />}
          {posicoes[i] && <Marker position={posicoes[i]} icon={entregador.icone} />}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapaEntregadores;
