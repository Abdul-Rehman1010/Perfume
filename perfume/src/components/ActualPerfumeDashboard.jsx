import React, { useState } from 'react';
import { Beaker, Plus, ArrowRight, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';

const ActualPerfumeDashboard = ({ actualPerfumes, formulas, onContinue, onNewBatch, onDelete, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState('');
  const [targetVolume, setTargetVolume] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFormulaId && targetVolume) {
      const formula = formulas.find(f => f._id === selectedFormulaId);
      onNewBatch(formula, parseFloat(targetVolume));
      setIsModalOpen(false);
      setSelectedFormulaId('');
      setTargetVolume('');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button onClick={onBack} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mb-2 flex items-center gap-1 font-medium">
            ← Back to Formulas
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Beaker className="text-indigo-600 dark:text-indigo-400" /> Physical Batches
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and log actual perfume creation</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> New Batch
        </button>
      </header>

      {actualPerfumes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Beaker size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No physical batches recorded yet.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Start your first batch</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actualPerfumes.slice().reverse().map(batch => {
            const currentVol = batch.ingredientsLog.reduce((sum, ing) => sum + ing.loggedAmount, 0);
            const percentage = Math.min((currentVol / batch.targetVolume) * 100, 100);
            
            return (
              <div key={batch._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{batch.formulaName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Target: {batch.targetVolume} ml</p>
                  </div>
                  {batch.status === 'Completed' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 size={12} /> Done
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle size={12} /> In Progress
                    </span>
                  )}
                </div>

                <div className="mb-6 flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                    <span className="text-gray-900 dark:text-white font-bold">{currentVol.toFixed(1)} / {batch.targetVolume} ml</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${batch.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-right">Last saved: {batch.lastModified}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <button 
                    onClick={() => onDelete(batch._id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {batch.status === 'In Progress' ? (
                    <button 
                      onClick={() => onContinue(batch)}
                      className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onContinue(batch)} // Can still view it
                      className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
                    >
                      View Log
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start Physical Batch</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Select Formula</label>
                <select 
                  required
                  value={selectedFormulaId}
                  onChange={(e) => setSelectedFormulaId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a formula --</option>
                  {formulas.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.totalVolume}ml base)</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Target Size (ml)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 100"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button 
                type="submit"
                disabled={!selectedFormulaId || !targetVolume}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
              >
                <Beaker size={20} /> Prepare Workspace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActualPerfumeDashboard;