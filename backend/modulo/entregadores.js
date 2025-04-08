const express = require('express');
const router = express.Router();
const model = require('../models/entregadorModel');

// GET /api/entregadores
router.get('/', async (req, res) => {
  const entregadores = await model.getTodosEntregadores();
  res.json(entregadores);
});

// POST /api/entregadores
router.post('/', async (req, res) => {
  const { nome, status } = req.body;
  const novo = await model.criarEntregador(nome, status);
  res.status(201).json(novo);
});

module.exports = router;
