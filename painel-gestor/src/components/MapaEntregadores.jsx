import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Ícones personalizados
const entregadorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const pontoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const MapaEntregadores = () => {
  const [entregador, setEntregador] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [status, setStatus] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('location:gestorUpdate', (data) => {
      const { entregadorId, latitude, longitude, origem, destino, status } = data;

      // Verificação básica para evitar coordenadas nulas
      if (latitude && longitude) {
        setEntregador({ id: entregadorId, latitude, longitude });
      }
      if (origem?.latitude && origem?.longitude) {
        setOrigem(origem);
      }
      if (destino?.latitude && destino?.longitude) {
        setDestino(destino);
      }
      setStatus(status || '');
    });

    return () => newSocket.close();
  }, []);

  const center =
    entregador?.latitude && entregador?.longitude
      ? [entregador.latitude, entregador.longitude]
      : [-23.55052, -46.633308]; // fallback: São Paulo

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={center} zoom={15} scrollWheelZoom={true} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {origem?.latitude && origem?.longitude && (
          <Marker position={[origem.latitude, origem.longitude]} icon={pontoIcon}>
            <Popup>📦 Origem</Popup>
          </Marker>
        )}

        {destino?.latitude && destino?.longitude && (
          <Marker position={[destino.latitude, destino.longitude]} icon={pontoIcon}>
            <Popup>🏁 Destino</Popup>
          </Marker>
        )}

        {entregador?.latitude && entregador?.longitude && (
          <Marker position={[entregador.latitude, entregador.longitude]} icon={entregadorIcon}>
            <Popup>
              Entregador #{entregador.id}<br />
              Status: <strong>{status}</strong>
            </Popup>
          </Marker>
        )}

        {origem?.latitude && origem?.longitude && destino?.latitude && destino?.longitude && (
          <Polyline
            positions={[
              [origem.latitude, origem.longitude],
              [destino.latitude, destino.longitude]
            ]}
            color="blue"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapaEntregadores;
