import React, { useState, useEffect } from 'react';
import PerfumeDashboard from './components/PerfumeDashboard';
import PerfumeEditor from './components/PerfumeEditor';
import IngredientsDashboard from './components/IngredientsDashboard';
import IngredientModal from './components/IngredientModal';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activePerfume, setActivePerfume] = useState(null);
  
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Rose Absolute', pricePer50ml: 100 },
    { id: '2', name: 'Bergamot', pricePer50ml: 45 },
    { id: '3', name: 'Sandalwood', pricePer50ml: 120 },
    { id: '4', name: 'Vanilla Extract', pricePer50ml: 30 },
    { id: '5', name: 'Oud', pricePer50ml: 250 },
  ]);

  const [perfumes, setPerfumes] = useState([]);

  useEffect(() => {
    const mockDatabase = [
      { 
        _id: '65f1a2b3c4d5', 
        name: 'Midnight Rose', 
        totalVolume: 100, 
        pricePer50ml: 85.50,
        formula: [
          { ingredientId: '1', name: 'Rose Absolute', amount: 60, pricePer50ml: 100 },
          { ingredientId: '2', name: 'Bergamot', amount: 40, pricePer50ml: 63.75 }
        ],
        lastModified: '2026-03-20'
      }
    ];
    setPerfumes(mockDatabase);
  }, []);

  const navigateToEditor = (perfumeData) => {
    setActivePerfume(perfumeData);
    setCurrentView('editor');
  };

  const navigateToDashboard = () => {
    setActivePerfume(null);
    setCurrentView('dashboard');
  };

  const navigateToIngredients = () => {
    setCurrentView('ingredients');
  };

  const openAddIngredientModal = () => {
    setEditingIngredient(null);
    setIsIngredientModalOpen(true);
  };

  const openEditIngredientModal = (ingredient) => {
    setEditingIngredient(ingredient);
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = (ingredientData) => {
    if (ingredientData.id) {
      setInventory(inventory.map(inv => inv.id === ingredientData.id ? ingredientData : inv));
      
      setPerfumes(perfumes.map(perfume => {
        const updatedFormula = perfume.formula.map(item => 
          item.ingredientId === ingredientData.id 
            ? { ...item, name: ingredientData.name, pricePer50ml: ingredientData.pricePer50ml }
            : item
        );
        
        const newTotalPrice = updatedFormula.reduce((total, item) => {
          const percentage = item.amount / perfume.totalVolume;
          return total + (percentage * item.pricePer50ml);
        }, 0);

        return { ...perfume, formula: updatedFormula, pricePer50ml: newTotalPrice };
      }));
      
    } else {
      const newIngredient = {
        ...ingredientData,
        id: Date.now().toString() 
      };
      setInventory([...inventory, newIngredient]);
    }
    setIsIngredientModalOpen(false);
  };

  const handleDeleteIngredient = (id) => {
    const isUsedInFormula = perfumes.some(perfume => 
      perfume.formula.some(item => item.ingredientId === id)
    );

    if (isUsedInFormula) {
      alert("Cannot delete this ingredient because it is currently used in an existing perfume formula.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      setInventory(inventory.filter(inv => inv.id !== id));
    }
  };

  const handleSavePerfume = (perfumeData) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (perfumeData._id) {
      setPerfumes(perfumes.map(p => 
        p._id === perfumeData._id 
          ? { ...perfumeData, lastModified: currentDate } 
          : p
      ));
    } else {
      const newPerfume = {
        ...perfumeData,
        _id: Date.now().toString(),
        lastModified: currentDate
      };
      setPerfumes([...perfumes, newPerfume]);
    }
    navigateToDashboard();
  };

  const handleDeletePerfume = (id) => {
    if (window.confirm('Are you sure you want to delete this formula?')) {
      setPerfumes(perfumes.filter(perfume => perfume._id !== id));
    }
  };

  return (
    <div className="App font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {currentView === 'dashboard' && (
        <PerfumeDashboard 
          perfumes={perfumes}
          onEdit={navigateToEditor} 
          onDelete={handleDeletePerfume}
          onManageIngredients={navigateToIngredients}
        />
      )}
      
      {currentView === 'editor' && (
        <PerfumeEditor 
          perfume={activePerfume} 
          inventory={inventory}
          onBack={navigateToDashboard} 
          onSave={handleSavePerfume}
          onAddIngredient={openAddIngredientModal}
        />
      )}

      {currentView === 'ingredients' && (
        <IngredientsDashboard 
          inventory={inventory}
          onBack={navigateToDashboard}
          onAdd={openAddIngredientModal}
          onEdit={openEditIngredientModal}
          onDelete={handleDeleteIngredient}
        />
      )}

      <IngredientModal 
        isOpen={isIngredientModalOpen}
        initialData={editingIngredient}
        onClose={() => setIsIngredientModalOpen(false)}
        onSave={handleSaveIngredient}
      />
    </div>
  );
}

export default App;