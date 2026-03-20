const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Ingredient = require('./models/Ingredient');
const Perfume = require('./models/Perfume');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

app.get('/api/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    const formattedIngredients = ingredients.map(ing => ({
      id: ing._id.toString(),
      name: ing.name,
      pricePer50ml: ing.pricePer50ml
    }));
    res.json(formattedIngredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ingredients', async (req, res) => {
  try {
    const newIngredient = new Ingredient({
      name: req.body.name,
      pricePer50ml: req.body.pricePer50ml
    });
    const savedIngredient = await newIngredient.save();
    res.status(201).json({
      id: savedIngredient._id.toString(),
      name: savedIngredient.name,
      pricePer50ml: savedIngredient.pricePer50ml
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/ingredients/:id', async (req, res) => {
  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, pricePer50ml: req.body.pricePer50ml },
      { new: true }
    );
    res.json({
      id: updatedIngredient._id.toString(),
      name: updatedIngredient.name,
      pricePer50ml: updatedIngredient.pricePer50ml
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/perfumes', async (req, res) => {
  try {
    const perfumes = await Perfume.find();
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/perfumes', async (req, res) => {
  try {
    const newPerfume = new Perfume(req.body);
    const savedPerfume = await newPerfume.save();
    res.status(201).json(savedPerfume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/perfumes/:id', async (req, res) => {
  try {
    const updatedPerfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPerfume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/perfumes/:id', async (req, res) => {
  try {
    await Perfume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Perfume deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});