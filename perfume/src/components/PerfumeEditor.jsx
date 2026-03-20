import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Plus, Trash2, History } from 'lucide-react';

const PerfumeEditor = ({ perfume, inventory, onBack, onSave, onAddIngredient }) => {
  const [formula, setFormula] = useState(perfume?.formula || []);
  const [additionLog, setAdditionLog] = useState([]);
  
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');

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

  const handleAddAmount = (e) => {
    e.preventDefault();
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
  };

  const handleSaveClick = () => {
    onSave({
      _id: perfume._id,
      name: perfume.name,
      formula,
      totalVolume,
      pricePer50ml: finalPricePer50ml
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-screen">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{perfume?.name}</h1>
            <p className="text-sm text-gray-500">{perfume?._id ? 'Editing Formula' : 'New Formula'}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Final Cost / 50ml</p>
            <p className="text-2xl font-bold text-green-600">Rs {finalPricePer50ml.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleSaveClick}
            disabled={formula.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Save size={20} />
            Save Perfume
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Formulation Pad</h2>
              <button onClick={onAddIngredient} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + New Ingredient
              </button>
            </div>
            
            <form onSubmit={handleAddAmount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Ingredient</label>
                <select 
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Choose --</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Rs {inv.pricePer50ml}/50ml)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add (ml/drops)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 2.5"
                />
              </div>
              <button 
                type="submit"
                disabled={!selectedIngredient || !amountToAdd}
                className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2"
              >
                <Plus size={20} /> Add to Mix
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History size={18} /> Addition Log
            </h2>
            <div className="overflow-y-auto pr-2 space-y-3 flex-1">
              {additionLog.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-10">No ingredients added yet.</p>
              ) : (
                additionLog.map(log => (
                  <div key={log.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-600">{log.time}</span>
                    <span className="font-medium text-gray-900">+{log.amount} {log.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold">Final Formula Breakdown</h2>
              <p className="text-gray-500 text-sm mt-1">Total Volume: <span className="font-bold text-gray-900">{totalVolume}</span></p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-600 text-sm rounded-tl-lg">Ingredient</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Total Amount</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Percentage</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Cost Share</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-sm rounded-tr-lg w-16"></th>
                </tr>
              </thead>
              <tbody>
                {formula.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      Start adding ingredients on the left to see the breakdown.
                    </td>
                  </tr>
                ) : (
                  formula.sort((a, b) => b.amount - a.amount).map(item => {
                    const percentage = (item.amount / totalVolume) * 100;
                    const costContribution = (item.amount / totalVolume) * item.pricePer50ml;
                    
                    return (
                      <tr key={item.ingredientId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                        <td className="py-3 px-4 text-gray-600">{item.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-12 text-gray-900 font-medium">{percentage.toFixed(1)}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">Rs {costContribution.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleRemoveIngredient(item.ingredientId)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
    </div>
  );
};

export default PerfumeEditor;