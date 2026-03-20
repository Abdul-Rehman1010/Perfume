const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  totalVolume: { 
    type: Number, 
    required: true 
  },
  pricePer50ml: { 
    type: Number, 
    required: true 
  },
  formula: [{
    ingredientId: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    pricePer50ml: { type: Number, required: true }
  }],
  lastModified: { 
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model('Perfume', perfumeSchema);