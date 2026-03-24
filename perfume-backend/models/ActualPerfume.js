const mongoose = require('mongoose');

const actualPerfumeSchema = new mongoose.Schema({
  formulaId: { type: String, required: true },
  formulaName: { type: String, required: true },
  targetVolume: { type: Number, required: true },
  status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
  ingredientsLog: [{
    ingredientId: { type: String, required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true }, // The rounded ml requirement
    loggedAmount: { type: Number, default: 0 }
  }],
  lastModified: { type: String, required: true }
});

module.exports = mongoose.model('ActualPerfume', actualPerfumeSchema);