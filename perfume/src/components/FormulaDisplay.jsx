import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Beaker, AlertCircle, X } from 'lucide-react';

const FormulaDisplay = ({ perfume, onEdit, onDelete, onBack, onMakePerfume }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetVolume, setTargetVolume] = useState('');
  const [batchTag, setBatchTag] = useState(''); // NEW STATE
  const [errorMsg, setErrorMsg] = useState('');

  if (!perfume) return null;

  const totalVolume = perfume.totalVolume;

  const handleStartBatch = (e) => {
    e.preventDefault();
    const target = parseFloat(targetVolume);
    
    if (isNaN(target) || target <= 0) {
      setErrorMsg("Please enter a valid number greater than 0.");
      return;
    }
    
    setIsModalOpen(false);
    // Pass the batch tag (passing null for existingBatch and false for isReadOnly)
    onMakePerfume(perfume, target, null, false, batchTag.trim());
    setBatchTag('');
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">{perfume.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Formula Overview • {perfume.lastModified}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center w-full md:w-auto gap-3 border-t md:border-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
          <button 
            onClick={() => onEdit(perfume)}
            className="flex-1 md:flex-none bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
          >
            <Edit size={18} /> Edit
          </button>
          <button 
            onClick={() => onDelete(perfume._id)}
            className="flex-1 md:flex-none bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
          >
            <Trash2 size={18} /> Delete
          </button>
          
          <button 
            onClick={() => { setIsModalOpen(true); setTargetVolume('100'); setBatchTag(''); setErrorMsg(''); }}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Beaker size={18} /> Make Perfume
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Batch Size</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVolume.toFixed(2)} ml</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Ingredients</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{perfume.formula.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Cost / 50ml</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">Rs {perfume.pricePer50ml.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ingredient Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Ingredient Name</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Amount (ml)</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Percentage</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Cost Contribution</th>
              </tr>
            </thead>
            <tbody>
              {[...perfume.formula].sort((a, b) => b.amount - a.amount).map(item => {
                const percentage = totalVolume === 0 ? 0 : (item.amount / totalVolume) * 100;
                const costContribution = (item.amount / totalVolume) * item.pricePer50ml;
                
                return (
                  <tr key={item.ingredientId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">{item.amount.toFixed(2)} ml</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-gray-900 dark:text-gray-100 font-medium">{percentage.toFixed(1)}%</span>
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">Rs {costContribution.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Start Physical Batch</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleStartBatch}>
              {errorMsg && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Target Size (ml)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  autoFocus
                  required
                  placeholder="e.g. 100"
                  value={targetVolume}
                  onChange={(e) => { setTargetVolume(e.target.value); setErrorMsg(''); }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg px-4 py-3 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* NEW: Optional Batch Tag Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Batch Tag <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Client X Order"
                  value={batchTag}
                  onChange={(e) => setBatchTag(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!targetVolume}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors"
                >
                  <Beaker size={18} /> Prepare Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaDisplay;