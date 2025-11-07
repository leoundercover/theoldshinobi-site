const PublisherService = require('../services/PublisherService');
const { toSnakeCase } = require('../utils/caseConverter');

/**
 * Listar todas as editoras
 */
const getAllPublishers = async (req, res, next) => {
  try {
    const publishers = await PublisherService.getAllPublishers();
    res.json({ publishers });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter uma editora por ID
 */
const getPublisherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publisher = await PublisherService.getPublisherById(id);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
};

/**
 * Criar uma nova editora (apenas admin)
 */
const createPublisher = async (req, res, next) => {
  try {
    const { name, description, logo_url } = req.body;

    const publisher = await PublisherService.createPublisher({
      name,
      description,
      logoUrl: logo_url,
    });

    res.status(201).json({
      message: 'Editora criada com sucesso',
      publisher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar uma editora (apenas admin)
 */
const updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logo_url } = req.body;

    const publisher = await PublisherService.updatePublisher(id, {
      name,
      description,
      logoUrl: logo_url,
    });

    res.json({
      message: 'Editora atualizada com sucesso',
      publisher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar uma editora (apenas admin)
 */
const deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PublisherService.deletePublisher(id);
    res.json({ message: 'Editora deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};
