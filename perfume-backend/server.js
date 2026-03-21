const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const exceljs = require('exceljs');
require('dotenv').config();

const Ingredient = require('./models/Ingredient');
const Perfume = require('./models/Perfume');
const Auth = require('./models/Auth');

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
  } catch (error) {
    console.error(error);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;
    let authData = await Auth.findOne();

    // If no password exists in DB yet, create the default one
    if (!authData) {
      authData = new Auth({ password: 'PerfumeStaff2026' });
      await authData.save();
    }

    if (password === authData.password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset', async (req, res) => {
  try {
    const { masterKey, newPassword } = req.body;

    if (masterKey !== process.env.MASTER_RECOVERY_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid Recovery Key' });
    }

    let authData = await Auth.findOne();
    if (!authData) {
      authData = new Auth({ password: newPassword });
    } else {
      authData.password = newPassword;
    }

    await authData.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Change Password Route
app.put('/api/auth/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let authData = await Auth.findOne();

    if (authData.password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is wrong' });
    }

    authData.password = newPassword;
    await authData.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/perfumes', async (req, res) => {
  try {
    const perfumes = await Perfume.find();
    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Perfume Formulas');

    worksheet.columns = [
      { header: 'Perfume Name', key: 'name', width: 25 },
      { header: 'Batch Volume (ml)', key: 'volume', width: 18 },
      { header: 'Total Cost (per 50ml)', key: 'cost', width: 22 },
      { header: 'Ingredient Name', key: 'ingredientName', width: 25 },
      { header: 'Amount (ml)', key: 'amount', width: 15 },
      { header: 'Ing. Cost (per 50ml)', key: 'ingCost', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FFE0E0E0' } 
    };

    perfumes.forEach(perfume => {
      if (perfume.formula.length === 0) {
        worksheet.addRow({
          name: perfume.name,
          volume: perfume.totalVolume,
          cost: perfume.pricePer50ml,
          ingredientName: '(No ingredients yet)',
          amount: 0,
          ingCost: 0
        });
      } else {
        perfume.formula.forEach((item, index) => {
          worksheet.addRow({
            name: index === 0 ? perfume.name : '',
            volume: index === 0 ? perfume.totalVolume : '',
            cost: index === 0 ? perfume.pricePer50ml : '',
            ingredientName: item.name,
            amount: item.amount,
            ingCost: item.pricePer50ml
          });
        });
      }
      
      worksheet.addRow([]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Perfume_Formulas.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;