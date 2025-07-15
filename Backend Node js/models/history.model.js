const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  possibleMatches: [{
    type: String
  }],
  dosage: String,
  frequency: String,
  duration: String,
  instructions: [String],
  warnings: [String],
  category: String,
  timeOfDay: {
    type: String,
    enum: ["morning", "afternoon", "evening", "night", "multiple"]
  },
  withFood: Boolean,
  withWater: Boolean
});

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  normalRange: {
    min: Number,
    max: Number
  },
  critical: {
    type: Boolean,
    default: false
  },
  trend: String,
  percentile: Number,
  lastUpdated: Date,
  category: String,
  interpretation: String
});

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['prescription', 'medical-test'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  results: {
    medicines: [medicineSchema],
    tests: [testSchema]
  }
}, {
  timestamps: true
});

// Index for better query performance
historySchema.index({ userId: 1, type: 1, uploadedAt: -1 });

module.exports = mongoose.model("History", historySchema); 