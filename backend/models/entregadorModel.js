const db = require('./db');

async function getTodosEntregadores() {
  const [rows] = await db.query('SELECT * FROM entregadores');
  return rows;
}

async function criarEntregador(nome, status = 'ativo') {
  const [result] = await db.query('INSERT INTO entregadores (nome, status) VALUES (?, ?)', [nome, status]);
  return { id: result.insertId, nome, status };
}

module.exports = {
  getTodosEntregadores,
  criarEntregador
};
