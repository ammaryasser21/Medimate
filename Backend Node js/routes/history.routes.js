const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Save prescription to history
router.post('/prescription', historyController.savePrescription);

// Save medical test to history
router.post('/medical-test', historyController.saveMedicalTest);

// Get prescription history only (specific route first)
router.get('/prescription', historyController.getPrescriptionHistory);

// Get medical test history only (specific route first)
router.get('/medical-test', historyController.getMedicalTestHistory);

// Get all history with optional filtering and pagination (general route last)
router.get('/', historyController.getAllHistory);

// Delete history item
router.delete('/:id', historyController.deleteHistoryItem);

module.exports = router; 