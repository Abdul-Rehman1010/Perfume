import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Plus, Trash2, History, AlertCircle, Copy, X } from 'lucide-react';
import SearchableSelect from './SearchableSelect'; // IMPORT NEW COMPONENT

const PerfumeEditor = ({ perfumes, perfume, inventory, onBack, onSave, onAddIngredient }) => {
  const [formula, setFormula] = useState(perfume?.formula || []);
  const [additionLog, setAdditionLog] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); 
  
  const [isSaveAsNewModalOpen, setIsSaveAsNewModalOpen] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  const totalVolume = useMemo(() => {
    return formula.reduce((sum, item) => sum + item.amount, 0);
  }, [formula]);

  const finalPricePer50ml = useMemo(() => {
    if (totalVolume === 0) return 0;
    return formula.reduce((total, item) => {
      const percentage = item.amount / totalVolume;
      return total + (percentage * item.pricePer50ml);
    }, 0);
  }, [formula, totalVolume]);

  const hasChanges = useMemo(() => {
    if (!perfume || !perfume.formula) return true;
    if (perfume.formula.length !== formula.length) return true;

    const orig = [...perfume.formula].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
    const curr = [...formula].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));

    for (let i = 0; i < orig.length; i++) {
      if (orig[i].ingredientId !== curr[i].ingredientId) return true;
      if (orig[i].amount !== curr[i].amount) return true;
    }
    return false;
  }, [formula, perfume]);

  const checkDuplicateFormula = (checkingAsNew = false) => {
    if (formula.length === 0 || totalVolume === 0) return false;

    const currentSignature = [...formula]
      .map(item => ({ id: item.ingredientId, pct: ((item.amount / totalVolume) * 100).toFixed(2) }))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    const currentSigString = JSON.stringify(currentSignature);

    for (const p of perfumes) {
      if (!checkingAsNew && p._id === perfume._id) continue;
      if (p.totalVolume === 0 || p.formula.length === 0) continue;

      const compareSignature = [...p.formula]
        .map(item => ({ id: item.ingredientId, pct: ((item.amount / p.totalVolume) * 100).toFixed(2) }))
        .sort((a, b) => a.id.localeCompare(b.id));

      if (currentSigString === JSON.stringify(compareSignature)) {
        return p.name;
      }
    }
    return false;
  };

  const handleAddAmount = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedIngredient || !amountToAdd || isNaN(amountToAdd) || Number(amountToAdd) <= 0) return;

    const ingredientData = inventory.find(inv => inv.id === selectedIngredient);
    const amountNum = parseFloat(amountToAdd);

    setAdditionLog(prev => [{
      id: Date.now(),
      name: ingredientData.name,
      amount: amountNum,
      time: new Date().toLocaleTimeString()
    }, ...prev]);

    setFormula(prevFormula => {
      const existing = prevFormula.find(item => item.ingredientId === selectedIngredient);
      if (existing) {
        return prevFormula.map(item => 
          item.ingredientId === selectedIngredient 
            ? { ...item, amount: item.amount + amountNum }
            : item
        );
      } else {
        return [...prevFormula, {
          ingredientId: ingredientData.id,
          name: ingredientData.name,
          pricePer50ml: ingredientData.pricePer50ml,
          amount: amountNum
        }];
      }
    });

    setAmountToAdd('');
  };

  const handleRemoveIngredient = (ingredientId) => {
    setFormula(prev => prev.filter(item => item.ingredientId !== ingredientId));
    setErrorMsg('');
  };

  const handleUpdateClick = () => {
    const duplicateName = checkDuplicateFormula(false);
    if (duplicateName) {
      setErrorMsg(`Cannot update! This exact percentage breakdown already exists in: "${duplicateName}".`);
      return; 
    }

    onSave({
      _id: perfume._id,
      name: perfume.name,
      formula,
      totalVolume,
      pricePer50ml: finalPricePer50ml
    });
  };

  const handleSaveAsNewSubmit = (e) => {
    e.preventDefault();
    setModalErrorMsg('');

    const trimmedName = newPerfumeName.trim();
    if (trimmedName) {
      const isDuplicateName = perfumes.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      if (isDuplicateName) {
        setModalErrorMsg('A formula with this name already exists.');
        return;
      }

      const duplicateFormulaName = checkDuplicateFormula(true);
      if (duplicateFormulaName) {
        setModalErrorMsg(`Cannot save! This exact percentage breakdown already exists in: "${duplicateFormulaName}".`);
        return;
      }

      onSave({
        _id: null,
        name: trimmedName,
        formula,
        totalVolume,
        pricePer50ml: finalPricePer50ml
      });
      setIsSaveAsNewModalOpen(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{perfume?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Editing Formula</p>
              {hasChanges && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">UNSAVED CHANGES</span>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full md:w-auto gap-4 sm:gap-6 border-t md:border-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Final Cost / 50ml</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">Rs {finalPricePer50ml.toFixed(2)}</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => { setIsSaveAsNewModalOpen(true); setModalErrorMsg(''); setNewPerfumeName(''); }}
              disabled={!hasChanges || formula.length === 0}
              className="flex-1 sm:flex-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors whitespace-nowrap"
            >
              <Copy size={18} />
              <span className="hidden sm:inline">Save as New</span>
              <span className="sm:hidden">As New</span>
            </button>
            <button 
              onClick={handleUpdateClick}
              disabled={!hasChanges || formula.length === 0}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors whitespace-nowrap"
            >
              <Save size={20} />
              <span className="hidden sm:inline">Update</span>
              <span className="sm:hidden">Update</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 flex-1 pb-8">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Formulation Pad</h2>
              <button onClick={onAddIngredient} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                + New
              </button>
            </div>
            
            <form onSubmit={handleAddAmount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Ingredient</label>
                {/* NEW SEARCHABLE SELECT IMPLEMENTED HERE */}
                <SearchableSelect 
                  options={inventory}
                  value={selectedIngredient}
                  onChange={(val) => { setSelectedIngredient(val); setErrorMsg(''); }}
                  placeholder="-- Search or select --"
                  renderOption={(inv) => `${inv.name} (Rs ${inv.pricePer50ml}/50ml)`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Add (ml)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={amountToAdd}
                  onChange={(e) => { setAmountToAdd(e.target.value); setErrorMsg(''); }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg px-4 py-3 sm:py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                  placeholder="e.g. 2.5"
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={!selectedIngredient || !amountToAdd}
                className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors"
              >
                <Plus size={20} /> Add to Mix
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-64 lg:flex-1 transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <History size={18} /> Addition Log
            </h2>
            <div className="overflow-y-auto pr-2 space-y-3 flex-1">
              {additionLog.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-6 sm:mt-10">No ingredients added yet.</p>
              ) : (
                additionLog.map(log => (
                  <div key={log.id} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{log.time}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">+{log.amount} {log.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="p-5 sm:p-6 pb-4 sm:pb-6 flex justify-between items-end border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Final Formula</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Total Volume: <span className="font-bold text-gray-900 dark:text-gray-100">{totalVolume}</span></p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Ingredient</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Amount</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Percentage</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Cost Share</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-xs sm:text-sm w-12"></th>
                </tr>
              </thead>
              <tbody>
                {formula.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400 dark:text-gray-500 px-4">
                      Start adding ingredients to see the breakdown.
                    </td>
                  </tr>
                ) : (
                  formula.sort((a, b) => b.amount - a.amount).map(item => {
                    const percentage = (item.amount / totalVolume) * 100;
                    const costContribution = (item.amount / totalVolume) * item.pricePer50ml;
                    
                    return (
                      <tr key={item.ingredientId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{item.name}</td>
                        <td className="py-3 px-4 sm:px-6 text-gray-600 dark:text-gray-300 text-sm sm:text-base">{item.amount.toFixed(2)} ml</td>
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="w-10 sm:w-12 text-gray-900 dark:text-gray-100 font-medium text-xs sm:text-sm">{percentage.toFixed(1)}%</span>
                            <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2 hidden xs:block">
                              <div className="bg-indigo-500 dark:bg-indigo-400 h-1.5 sm:h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-gray-600 dark:text-gray-300 text-sm sm:text-base">Rs {costContribution.toFixed(2)}</td>
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <button 
                            onClick={() => handleRemoveIngredient(item.ingredientId)}
                            className="p-2 -mr-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isSaveAsNewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 transition-colors shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Save as New Formula</h2>
              <button onClick={() => setIsSaveAsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAsNewSubmit}>
              {modalErrorMsg && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{modalErrorMsg}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Perfume Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Summer Breeze V2"
                  value={newPerfumeName}
                  onChange={(e) => { setNewPerfumeName(e.target.value); setModalErrorMsg(''); }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg px-4 py-3 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsSaveAsNewModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newPerfumeName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800/50 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Save as New
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfumeEditor;