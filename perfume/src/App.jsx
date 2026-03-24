import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerfumeDashboard from './components/PerfumeDashboard';
import PerfumeEditor from './components/PerfumeEditor';
import PerfumeCreator from './components/PerfumeCreator';
import IngredientsDashboard from './components/IngredientsDashboard';
import FormulaDisplay from './components/FormulaDisplay';
import ActualPerfumeDashboard from './components/ActualPerfumeDashboard';
import MakePerfume from './components/MakePerfume';
import IngredientModal from './components/IngredientModal';
import PasswordModal from './components/PasswordModal';
import LoginPage from './components/LoginPage';

const API_URL = 'https://perfume-one-black.vercel.app/api';

const sortAlphabetically = (array) => {
  return [...array].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [inventory, setInventory] = useState([]);
  const [perfumes, setPerfumes] = useState([]);
  const [actualPerfumes, setActualPerfumes] = useState([]);

  const [activePerfume, setActivePerfume] = useState(null);
  const [creatorPerfumeName, setCreatorPerfumeName] = useState('');
  const [creatorMode, setCreatorMode] = useState('lab');
  const [activeMakeData, setActiveMakeData] = useState(null); 

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'isLoggedIn' && event.newValue !== 'true') {
        setIsLoggedIn(false);
        setCurrentView('dashboard');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchInitialData = async () => {
        try {
          const [ingredientsRes, perfumesRes, actualsRes] = await Promise.all([
            axios.get(`${API_URL}/ingredients`),
            axios.get(`${API_URL}/perfumes`),
            axios.get(`${API_URL}/actual-perfumes`) 
          ]);
          
          setInventory(sortAlphabetically(ingredientsRes.data));
          setPerfumes(sortAlphabetically(perfumesRes.data));
          setActualPerfumes(actualsRes.data); 

          const params = new URLSearchParams(window.location.search);
          const viewParam = params.get('view');
          const idParam = params.get('id');

          if (viewParam === 'formula' && idParam) {
            const targetPerfume = perfumesRes.data.find(p => p._id === idParam);
            if (targetPerfume) {
              setActivePerfume(targetPerfume);
              setCurrentView('formulaDisplay');
            } else {
              window.history.replaceState({}, document.title, window.location.pathname);
              setCurrentView('dashboard');
            }
          }
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
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const navigateToDashboard = () => {
    setActivePerfume(null);
    setCreatorPerfumeName('');
    setActiveMakeData(null);
    setCurrentView('dashboard');
    window.history.replaceState({}, document.title, window.location.pathname); 
  };

  const navigateToEditor = (perfumeData) => {
    setActivePerfume(perfumeData);
    setCurrentView('editor');
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

  // UPDATED: Now accepts batchTag and auto-calculates the batch number
  // UPDATED: Smart Batch Numbering System
  const handleStartMakePerfume = (formula, targetVolume, existingBatch = null, isReadOnly = false, batchTag = '') => {
    let batchNumber = 1;
    
    if (!existingBatch) {
      // 1. Get all existing physical batches for this specific formula
      const formulaBatches = actualPerfumes.filter(b => b.formulaId === formula._id);
      
      // 2. Create a "Set" (a collection of unique numbers) to store used batch numbers
      const usedNumbers = new Set();
      
      // 3. Extract the batch number from the saved names using a Regex pattern
      formulaBatches.forEach(b => {
        const match = b.formulaName.match(/\(Batch #(\d+)\)/);
        if (match && match[1]) {
          usedNumbers.add(parseInt(match[1], 10));
        }
      });

      // 4. Start at 1 and keep counting up until we find a number that isn't used
      while (usedNumbers.has(batchNumber)) {
        batchNumber++;
      }
    }
    
    setActiveMakeData({ formula, targetVolume, existingBatch, isReadOnly, batchNumber, batchTag });
    setCurrentView('makePerfume');
  };
  
  const handleSaveActualPerfume = async (actualData) => {
    // THE FIX: Use an absolute, universal ISO string instead of a regional locale string
    const currentDate = new Date().toISOString(); 
    
    const { _id, ...restData } = actualData; 
    const dataToSave = { ...restData, lastModified: currentDate };
    
    try {
      if (_id) {
        const res = await axios.put(`${API_URL}/actual-perfumes/${_id}`, { ...dataToSave, _id });
        setActualPerfumes(prev => prev.map(p => p._id === _id ? res.data : p));
      } else {
        const res = await axios.post(`${API_URL}/actual-perfumes`, dataToSave);
        setActualPerfumes(prev => [...prev, res.data]);
      }
      setCurrentView('actualDashboard');
      setActiveMakeData(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteActualPerfume = async (id) => {
    if (window.confirm('Delete this batch log?')) {
      try {
        await axios.delete(`${API_URL}/actual-perfumes/${id}`);
        setActualPerfumes(prev => prev.filter(p => p._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSavePerfume = async (perfumeData) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const { _id, ...restData } = perfumeData;
    const dataToSave = { ...restData, lastModified: currentDate };
    
    try {
      let savedData;
      if (_id) {
        const res = await axios.put(`${API_URL}/perfumes/${_id}`, { ...dataToSave, _id });
        setPerfumes(prev => sortAlphabetically(prev.map(p => p._id === _id ? res.data : p)));
        savedData = res.data;
      } else {
        const res = await axios.post(`${API_URL}/perfumes`, dataToSave);
        setPerfumes(prev => sortAlphabetically([...prev, res.data]));
        savedData = res.data;
      }

      if (currentView === 'editor' && window.location.search.includes('view=formula')) {
        setActivePerfume(savedData);
        setCurrentView('formulaDisplay');
      } else {
        navigateToDashboard();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePerfume = async (id) => {
    const inProgressBatch = actualPerfumes.some(batch => batch.formulaId === id && batch.status === 'In Progress');
    if (inProgressBatch) {
      alert("Cannot delete this formula. You have an active, incomplete physical batch using it. Please complete or delete the batch first.");
      return;
    }

    if (window.confirm('Are you sure you want to delete this formula?')) {
      try {
        await axios.delete(`${API_URL}/perfumes/${id}`);
        setPerfumes(prev => prev.filter(perfume => perfume._id !== id));
        if (activePerfume && activePerfume._id === id) navigateToDashboard();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveIngredient = async (ingredientData) => {
    try {
      if (ingredientData.id) {
        const res = await axios.put(`${API_URL}/ingredients/${ingredientData.id}`, ingredientData);
        const updatedIng = res.data;
        
        setInventory(prev => sortAlphabetically(prev.map(inv => inv.id === updatedIng.id ? updatedIng : inv)));
        
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
        setInventory(prev => sortAlphabetically([...prev, res.data]));
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

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      {currentView === 'dashboard' && (
        <PerfumeDashboard 
          perfumes={perfumes}
          onCreate={(name, mode) => { setCreatorPerfumeName(name); setCreatorMode(mode); setCurrentView('creator'); }} 
          onEdit={navigateToEditor} 
          onDelete={handleDeletePerfume}
          onManageIngredients={navigateToIngredients}
          onOpenActualDashboard={() => setCurrentView('actualDashboard')}
          onChangePassword={() => setIsPasswordModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'actualDashboard' && (
        <ActualPerfumeDashboard 
          actualPerfumes={actualPerfumes}
          formulas={perfumes}
          onBack={navigateToDashboard}
          onNewBatch={handleStartMakePerfume}
          onContinue={(batch) => {
            let formula = perfumes.find(f => f._id === batch.formulaId);
            let isReadOnly = false;
            
            if (!formula) {
              isReadOnly = true;
              formula = {
                _id: batch.formulaId,
                name: batch.formulaName, 
                totalVolume: batch.targetVolume,
                formula: batch.ingredientsLog.map(ing => ({
                  ingredientId: ing.ingredientId,
                  name: ing.name,
                  amount: ing.targetAmount
                }))
              };
            }
            
            // For continuing, we pass null for batchTag since it's already saved in the name
            handleStartMakePerfume(formula, batch.targetVolume, batch, isReadOnly, '');
          }}
          onDelete={handleDeleteActualPerfume}
        />
      )}

      {currentView === 'makePerfume' && activeMakeData && (
        <MakePerfume 
          formula={activeMakeData.formula}
          targetVolume={activeMakeData.targetVolume}
          existingBatch={activeMakeData.existingBatch}
          isReadOnly={activeMakeData.isReadOnly}
          batchNumber={activeMakeData.batchNumber} // NEW PROP
          batchTag={activeMakeData.batchTag}       // NEW PROP
          onBack={() => setCurrentView('actualDashboard')}
          onSave={handleSaveActualPerfume}
        />
      )}
      
      {currentView === 'formulaDisplay' && (
        <FormulaDisplay 
          perfume={activePerfume}
          onEdit={navigateToEditor}
          onDelete={handleDeletePerfume}
          onMakePerfume={handleStartMakePerfume}
          onBack={navigateToDashboard}
        />
      )}

      {currentView === 'creator' && (/* Unchanged */
        <PerfumeCreator perfumes={perfumes} perfumeName={creatorPerfumeName} mode={creatorMode} inventory={inventory} onBack={navigateToDashboard} onSave={handleSavePerfume} onAddIngredient={openAddIngredientModal} />
      )}
      {currentView === 'editor' && (/* Unchanged */
        <PerfumeEditor perfumes={perfumes} perfume={activePerfume} inventory={inventory} onBack={() => { if (window.location.search.includes('view=formula')) { setCurrentView('formulaDisplay'); } else { navigateToDashboard(); } }} onSave={handleSavePerfume} onAddIngredient={openAddIngredientModal} />
      )}
      {currentView === 'ingredients' && (/* Unchanged */
        <IngredientsDashboard inventory={inventory} onBack={navigateToDashboard} onAdd={openAddIngredientModal} onEdit={openEditIngredientModal} onDelete={handleDeleteIngredient} />
      )}

      <IngredientModal isOpen={isIngredientModalOpen} initialData={editingIngredient} onClose={() => setIsIngredientModalOpen(false)} onSave={handleSaveIngredient} />
      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}

export default App;