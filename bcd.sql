CREATE DATABASE IF NOT EXISTS entregas;
USE entregas;

-- Tabela de entregadores
CREATE TABLE IF NOT EXISTS entregadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo'
);

-- Tabela de rotas
CREATE TABLE IF NOT EXISTS rotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entregador_id INT,
  ponto_inicio VARCHAR(255),
  ponto_fim VARCHAR(255),
  FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

-- Tabela de checkpoints (paradas no caminho)
CREATE TABLE IF NOT EXISTS checkpoints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rota_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  ordem INT,
  FOREIGN KEY (rota_id) REFERENCES rotas(id)
);

-- Tabela de localizações em tempo real
CREATE TABLE IF NOT EXISTS localizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entregador_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

SELECT * FROM localizacoes ORDER BY id DESC LIMIT 10;

INSERT INTO entregadores (id, nome)
VALUES (1, 'Entregador Simulado');

show tables;

-- Tabela de viagens
CREATE TABLE IF NOT EXISTS viagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entregador_id INT,
  latitude_partida DECIMAL(10, 8),
  longitude_partida DECIMAL(11, 8),
  latitude_destino DECIMAL(10, 8),
  longitude_destino DECIMAL(11, 8),
  FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
);

ALTER TABLE viagens
  ADD COLUMN ponto_inicio_lat DECIMAL(10, 8),
  ADD COLUMN ponto_inicio_lng DECIMAL(11, 8),
  ADD COLUMN ponto_fim_lat DECIMAL(10, 8),
  ADD COLUMN ponto_fim_lng DECIMAL(11, 8),
  ADD COLUMN status ENUM('em rota', 'chegou') DEFAULT 'em rota';
  
SELECT * FROM viagens WHERE entregador_id = 1 ORDER BY id DESC LIMIT 1;


UPDATE viagens
SET
  ponto_inicio_lat = -23.55052,
  ponto_inicio_lng = -46.633308,
  ponto_fim_lat = -23.56123,
  ponto_fim_lng = -46.654321
WHERE entregador_id = 1;



INSERT INTO viagens (entregador_id, latitude_partida, longitude_partida, latitude_destino, longitude_destino)
VALUES (1, -23.55052, -46.633308, -23.5587, -46.6253);

