📦 Painel de Rastreamento de Entregadores
Este projeto é um painel de visualização em tempo real dos entregadores em rota, utilizando React + Leaflet para exibição no mapa, e simulação de movimentação com dados do backend.

🗺️ Funcionalidades
Exibe motoristas em tempo real no mapa

Ícones personalizados e rotas destacadas

Movimentação simulada dos motoristas entre pontos de origem e destino

Suporte a múltiplos entregadores simultaneamente

🚀 Como Rodar o Projeto
Pré-requisitos
Node.js instalado

npm (ou yarn)

O projeto precisa ser clonado com as seguintes pastas e arquivos:

index.js

simulador.js

painel-gestor/ (projeto React)

📁 Estrutura esperada
markdown
Copiar
Editar
seu-projeto/
├── index.js
├── simulador.js
└── painel-gestor/
    └── (código React)
💻 Passo a Passo
Abra 3 terminais diferentes.

No primeiro terminal, rode o servidor principal:
node index.js

No segundo terminal, rode o simulador de movimento:
node simulador.js

No terceiro terminal, entre na pasta do painel (frontend React):
cd painel-gestor
npm install
npm run dev

Acesse o projeto no navegador:
👉 http://localhost:5173

🧪 Testando
Você verá os motoristas se movendo em tempo real no mapa, cada um com sua rota destacada e ícone próprio.

🛠️ Tecnologias Utilizadas
React.js

Vite

Leaflet

Express.js

Node.js

Mapbox Polyline
