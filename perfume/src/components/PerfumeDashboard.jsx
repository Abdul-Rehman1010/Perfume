import React, { useState } from 'react';
import { Grid, List, Edit, Trash2, Plus, Beaker, X } from 'lucide-react';

const PerfumeDashboard = ({ perfumes, onEdit, onDelete, onManageIngredients }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newPerfumeName, setNewPerfumeName] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newPerfumeName.trim()) {
      setIsNameModalOpen(false);
      onEdit({ 
        _id: null, 
        name: newPerfumeName.trim(), 
        formula: [],
        totalVolume: 0,
        pricePer50ml: 0
      });
      setNewPerfumeName('');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Perfume Formulas</h1>
            <p className="text-gray-500 mt-1">Manage your ingredient breakdowns and costs</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>

            <button 
              onClick={onManageIngredients}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Beaker size={20} />
              Manage Ingredients
            </button>
            
            <button 
              onClick={() => setIsNameModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              New Formula
            </button>
          </div>
        </header>

        {perfumes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No perfumes found. Create your first formula!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {perfumes.map((perfume) => (
              <div key={perfume._id} className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md ${viewMode === 'list' ? 'flex justify-between items-center' : ''}`}>
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{perfume.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                      ${perfume.pricePer50ml.toFixed(2)} / 50ml
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 flex justify-between">
                      <span className="font-medium">Total Batch:</span> 
                      <span>{perfume.totalVolume}ml</span>
                    </p>
                    <p className="text-sm text-gray-600 flex justify-between">
                      <span className="font-medium">Ingredients:</span> 
                      <span>{perfume.formula.length}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                      Last edited: {perfume.lastModified}
                    </p>
                  </div>
                </div>

                <div className={`flex gap-2 ${viewMode === 'grid' ? 'mt-6 pt-4 border-t border-gray-100' : 'ml-6'}`}>
                  <button 
                    onClick={() => onEdit(perfume)}
                    className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                  >
                    <Edit size={16} />
                    {viewMode === 'grid' && "Edit"}
                  </button>
                  <button 
                    onClick={() => onDelete(perfume._id)}
                    className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={16} />
                    {viewMode === 'grid' && "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Name Your Perfume</h2>
              <button onClick={() => setIsNameModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Summer Breeze"
                value={newPerfumeName}
                onChange={(e) => setNewPerfumeName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button 
                type="submit"
                disabled={!newPerfumeName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 rounded-lg"
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