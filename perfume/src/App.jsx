import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerfumeDashboard from './components/PerfumeDashboard';
import PerfumeEditor from './components/PerfumeEditor';
import PerfumeCreator from './components/PerfumeCreator';
import IngredientsDashboard from './components/IngredientsDashboard';
import IngredientModal from './components/IngredientModal';
import PasswordModal from './components/PasswordModal';
import LoginPage from './components/LoginPage';

const API_URL = 'https://perfume-one-black.vercel.app/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [currentView, setCurrentView] = useState('dashboard');
  const [activePerfume, setActivePerfume] = useState(null);
  const [creatorPerfumeName, setCreatorPerfumeName] = useState('');
  const [creatorMode, setCreatorMode] = useState('lab');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [perfumes, setPerfumes] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchInitialData = async () => {
        try {
          const [ingredientsRes, perfumesRes] = await Promise.all([
            axios.get(`${API_URL}/ingredients`),
            axios.get(`${API_URL}/perfumes`)
          ]);
          setInventory(ingredientsRes.data);
          setPerfumes(perfumesRes.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchInitialData();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  const navigateToEditor = (perfumeData) => {
    setActivePerfume(perfumeData);
    setCurrentView('editor');
  };

  const navigateToCreator = (perfumeName, mode) => {
    setCreatorPerfumeName(perfumeName);
    setCreatorMode(mode);
    setCurrentView('creator');
  };

  const navigateToDashboard = () => {
    setActivePerfume(null);
    setCreatorPerfumeName('');
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

  const handleSaveIngredient = async (ingredientData) => {
    try {
      if (ingredientData.id) {
        const res = await axios.put(`${API_URL}/ingredients/${ingredientData.id}`, ingredientData);
        const updatedIng = res.data;
        
        // Use prev state to avoid stale closures
        setInventory(prev => prev.map(inv => inv.id === updatedIng.id ? updatedIng : inv));
        
        setPerfumes(prevPerfumes => {
          const updatedPerfumes = prevPerfumes.map(perfume => {
            const updatedFormula = perfume.formula.map(item => 
              item.ingredientId === updatedIng.id 
                ? { ...item, name: updatedIng.name, pricePer50ml: updatedIng.pricePer50ml }
                : item
            );
            
            const newTotalPrice = updatedFormula.reduce((total, item) => {
              const percentage = item.amount / perfume.totalVolume;
              return total + (percentage * updatedIng.pricePer50ml);
            }, 0);

            return { ...perfume, formula: updatedFormula, pricePer50ml: newTotalPrice };
          });
          
          updatedPerfumes.forEach(async (perfume) => {
            await axios.put(`${API_URL}/perfumes/${perfume._id}`, perfume);
          });

          return updatedPerfumes;
        });

      } else {
        const res = await axios.post(`${API_URL}/ingredients`, ingredientData);
        setInventory(prev => [...prev, res.data]);
      }
      setIsIngredientModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteIngredient = async (id) => {
    const isUsedInFormula = perfumes.some(perfume => 
      perfume.formula.some(item => item.ingredientId === id)
    );

    if (isUsedInFormula) {
      alert("Cannot delete this ingredient because it is currently used in an existing perfume formula.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await axios.delete(`${API_URL}/ingredients/${id}`);
        setInventory(prev => prev.filter(inv => inv.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSavePerfume = async (perfumeData) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // FIX: Destructure out _id so we don't accidentally send `_id: null` to the backend.
    // This allows Mongoose to properly generate and return the real database ID.
    const { _id, ...restData } = perfumeData;
    const dataToSave = { ...restData, lastModified: currentDate };
    
    try {
      if (_id) {
        // We are updating an existing perfume
        const res = await axios.put(`${API_URL}/perfumes/${_id}`, { ...dataToSave, _id });
        // Use prev state to ensure we always update the latest version of the array
        setPerfumes(prev => prev.map(p => p._id === _id ? res.data : p));
      } else {
        // We are creating a brand new perfume
        const res = await axios.post(`${API_URL}/perfumes`, dataToSave);
        // Use prev state to append the newly generated data (which now includes the real _id)
        setPerfumes(prev => [...prev, res.data]);
      }
      navigateToDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePerfume = async (id) => {
    if (window.confirm('Are you sure you want to delete this formula?')) {
      try {
        await axios.delete(`${API_URL}/perfumes/${id}`);
        // Use prev state to safely remove the item
        setPerfumes(prev => prev.filter(perfume => perfume._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {currentView === 'dashboard' && (
        <PerfumeDashboard 
          perfumes={perfumes}
          onCreate={navigateToCreator} 
          onEdit={navigateToEditor} 
          onDelete={handleDeletePerfume}
          onManageIngredients={navigateToIngredients}
          onChangePassword={() => setIsPasswordModalOpen(true)}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'creator' && (
        <PerfumeCreator
          perfumes={perfumes} 
          perfumeName={creatorPerfumeName} 
          mode={creatorMode} 
          inventory={inventory}
          onBack={navigateToDashboard} 
          onSave={handleSavePerfume}
          onAddIngredient={openAddIngredientModal}
        />
      )}

      {currentView === 'editor' && (
        <PerfumeEditor 
          perfumes={perfumes}
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

      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

export default App;