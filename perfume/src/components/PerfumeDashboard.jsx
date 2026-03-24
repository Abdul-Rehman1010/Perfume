import React, { useState } from 'react';
import axios from 'axios';
import { Grid, List, Edit, Trash2, Plus, Beaker, X, Download, Lock, LogOut, AlertCircle } from 'lucide-react';

// FIXED: Added onOpenActualDashboard to the props list
const PerfumeDashboard = ({ perfumes, onCreate, onEdit, onDelete, onManageIngredients, onOpenActualDashboard, onChangePassword, onLogout }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');
  const [creationMode, setCreationMode] = useState('lab');
  const [nameError, setNameError] = useState(''); 

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setNameError(''); 
    
    const trimmedName = newPerfumeName.trim();
    if (trimmedName) {
      const isDuplicate = perfumes.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      
      if (isDuplicate) {
        setNameError('A formula with this name already exists.');
        return;
      }

      setIsNameModalOpen(false);
      onCreate(trimmedName, creationMode);
      setNewPerfumeName('');
      setCreationMode('lab');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get('https://perfume-one-black.vercel.app/api/export/perfumes', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Perfume_Formulas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Failed to download the Excel file.");
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Perfume Formulas</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Manage your ingredient breakdowns and costs</p>
          </div>
          
          <div className="flex flex-col w-full md:w-auto gap-3 md:items-end">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button onClick={onChangePassword} className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm sm:text-base shadow-sm">
                <Lock size={18} /><span>Change Password</span>
              </button>
              <button onClick={handleDownloadExcel} className="w-full sm:w-auto bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm sm:text-base shadow-sm">
                <Download size={18} /><span>Export</span>
              </button>
              <button onClick={onLogout} className="w-full sm:w-auto bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-red-200 dark:border-red-800 text-sm sm:text-base shadow-sm">
                <LogOut size={18} /><span>Logout</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
              <div className="flex w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 transition-colors shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Grid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><List size={18} /></button>
              </div>
              <button onClick={onManageIngredients} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm sm:text-base shadow-sm">
                <Beaker size={18} /><span>Ingredients</span>
              </button>
              
              {/* FIXED: Removed the invalid JSX comment here */}
              <button onClick={onOpenActualDashboard} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                <Beaker size={18} />
                <span>Physical Batches</span>
              </button>
              
              <button onClick={() => { setIsNameModalOpen(true); setNameError(''); }} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm sm:text-base shadow-sm">
                <Plus size={18} /><span>New Formula</span>
              </button>
            </div>
          </div>
        </header>

        {perfumes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400">No perfumes found. Create your first formula!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
            {perfumes.map((perfume) => (
              viewMode === 'grid' ? (
                <div key={perfume._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start">
                      <a 
                        href={`?view=formula&id=${perfume._id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline-offset-4 hover:underline"
                      >
                        {perfume.name}
                      </a>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200 dark:border-green-800 transition-colors">
                        Rs {perfume.pricePer50ml.toFixed(2)} / 50ml
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex justify-between"><span className="font-medium">Total Batch:</span> <span>{perfume.totalVolume}ml</span></p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex justify-between"><span className="font-medium">Ingredients:</span> <span>{perfume.formula.length}</span></p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">Last edited: {perfume.lastModified}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => onEdit(perfume)} className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"><Edit size={16} /> Edit</button>
                    <button onClick={() => onDelete(perfume._id)} className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              ) : (
                <div key={perfume._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-sm transition-all">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
                    
                    <a 
                      href={`?view=formula&id=${perfume._id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-gray-900 dark:text-gray-100 min-w-[150px] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline-offset-4 hover:underline"
                    >
                      {perfume.name}
                    </a>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded border border-green-200 dark:border-green-800">Rs {perfume.pricePer50ml.toFixed(2)}</span>
                      <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span><span>{perfume.totalVolume}ml</span>
                      <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span><span>{perfume.formula.length} parts</span>
                      <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span><span className="hidden md:inline text-xs text-gray-400">{perfume.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
                    <button onClick={() => onEdit(perfume)} className="flex-1 sm:flex-none p-2 sm:px-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex justify-center items-center"><Edit size={18} /></button>
                    <button onClick={() => onDelete(perfume._id)} className="flex-1 sm:flex-none p-2 sm:px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex justify-center items-center"><Trash2 size={18} /></button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 transition-colors shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Start New Formula</h2>
              <button onClick={() => setIsNameModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              
              {nameError && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{nameError}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Perfume Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Summer Breeze"
                  value={newPerfumeName}
                  onChange={(e) => { setNewPerfumeName(e.target.value); setNameError(''); }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg px-4 py-3 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Creation Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`border rounded-lg p-3 cursor-pointer transition-all ${creationMode === 'lab' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <input type="radio" className="hidden" name="mode" value="lab" checked={creationMode === 'lab'} onChange={() => setCreationMode('lab')} />
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Lab Mode</div>
                    <div className="text-xs text-gray-500 mt-1">Freeform (Add drops in ml)</div>
                  </label>
                  <label className={`border rounded-lg p-3 cursor-pointer transition-all ${creationMode === 'formula' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <input type="radio" className="hidden" name="mode" value="formula" checked={creationMode === 'formula'} onChange={() => setCreationMode('formula')} />
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Formula Mode</div>
                    <div className="text-xs text-gray-500 mt-1">Strict (100% total limit)</div>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newPerfumeName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 text-white font-medium py-3 sm:py-2 rounded-lg transition-colors"
              >
                Start Formulating
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfumeDashboard;