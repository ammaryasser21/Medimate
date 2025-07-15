const History = require('../models/history.model');
const wrapper = require('../ErrorWrapper/asyncwrapper');
const AppError = require('../utilitis/AppError');

// Save prescription to history
exports.savePrescription = wrapper(async (req, res, next) => {
  const { fileName, results } = req.body;
  
  if (!fileName || !results) {
    return next(AppError.create(400, "fileName and results are required"));
  }

  const history = new History({
    userId: req.user.userId,
    type: 'prescription',
    fileName,
    results: {
      medicines: results.medicines || []
    }
  });

  await history.save();

  res.status(200).json({
    success: true,
    data: {
      id: history._id,
      type: history.type,
      fileName: history.fileName,
      uploadedAt: history.uploadedAt,
      results: history.results
    },
    message: "Prescription saved successfully"
  });
});

// Save medical test to history
exports.saveMedicalTest = wrapper(async (req, res, next) => {
  const { fileName, results } = req.body;
  
  if (!fileName || !results) {
    return next(AppError.create(400, "fileName and results are required"));
  }

  const history = new History({
    userId: req.user.userId,
    type: 'medical-test',
    fileName,
    results: {
      tests: results.tests || []
    }
  });

  await history.save();

  res.status(200).json({
    success: true,
    data: {
      id: history._id,
      type: history.type,
      fileName: history.fileName,
      uploadedAt: history.uploadedAt,
      results: history.results
    },
    message: "Medical test saved successfully"
  });
});

// Get all history with pagination and filtering
exports.getAllHistory = wrapper(async (req, res, next) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    
    // Validate user object exists
    if (!req.user || !req.user.userId) {
      return next(AppError.create(401, "User authentication required"));
    }
    
    const query = { userId: req.user.userId };
    if (type && ['prescription', 'medical-test'].includes(type)) {
      query.type = type;
    }

    const total = await History.countDocuments(query);
    const history = await History.find(query)
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: history.map(item => ({
        id: item._id,
        type: item.type,
        fileName: item.fileName,
        uploadedAt: item.uploadedAt,
        results: item.results
      })),
      message: "History retrieved successfully",
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + history.length
      }
    });
  } catch (error) {
    console.error('Error in getAllHistory:', error);
    return next(AppError.create(500, "Internal server error"));
  }
});

// Get prescription history only
exports.getPrescriptionHistory = wrapper(async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    if (!req.user || !req.user.userId) {
      return next(AppError.create(401, "User authentication required"));
    }

    const total = await History.countDocuments({ 
      userId: req.user.userId, 
      type: 'prescription' 
    });
    
    const history = await History.find({ 
      userId: req.user.userId, 
      type: 'prescription' 
    })
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: history.map(item => ({
        id: item._id,
        type: item.type,
        fileName: item.fileName,
        uploadedAt: item.uploadedAt,
        results: item.results
      })),
      message: "Prescription history retrieved successfully",
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + history.length
      }
    });
  } catch (error) {
    console.error('Error in getPrescriptionHistory:', error);
    return next(AppError.create(500, "Internal server error"));
  }
});

// Get medical test history only
exports.getMedicalTestHistory = wrapper(async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    if (!req.user || !req.user.userId) {
      return next(AppError.create(401, "User authentication required"));
    }

    const total = await History.countDocuments({ 
      userId: req.user.userId, 
      type: 'medical-test' 
    });
    
    const history = await History.find({ 
      userId: req.user.userId, 
      type: 'medical-test' 
    })
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: history.map(item => ({
        id: item._id,
        type: item.type,
        fileName: item.fileName,
        uploadedAt: item.uploadedAt,
        results: item.results
      })),
      message: "Medical test history retrieved successfully",
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + history.length
      }
    });
  } catch (error) {
    console.error('Error in getMedicalTestHistory:', error);
    return next(AppError.create(500, "Internal server error"));
  }
});

// Delete history item
exports.deleteHistoryItem = wrapper(async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.userId) {
      return next(AppError.create(401, "User authentication required"));
    }

    const history = await History.findById(id);
    
    if (!history) {
      return next(AppError.create(404, "History item not found"));
    }

    // Check if user owns this history item
    if (history.userId.toString() !== req.user.userId) {
      return next(AppError.create(403, "You can only delete your own history items"));
    }

    await History.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "History item deleted successfully"
    });
  } catch (error) {
    console.error('Error in deleteHistoryItem:', error);
    return next(AppError.create(500, "Internal server error"));
  }
}); 