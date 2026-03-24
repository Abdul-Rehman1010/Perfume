import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Edit, Trash2, Beaker } from 'lucide-react';

const IngredientsDashboard = ({ inventory, onBack, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // ENFORCED RENDER-LEVEL SORTING
  const sortedInventory = [...inventory].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
  });

  // Apply search filter on top of the sorted list
  const filteredInventory = sortedInventory.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={onBack} 
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Beaker className="text-indigo-600 dark:text-indigo-400" />
              Ingredient Library
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your raw materials and base costs
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            />
          </div>
          <button 
            onClick={onAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus size={20} /> New Ingredient
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Ingredient Name</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Cost / 50ml</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Beaker size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                        {inventory.length === 0 ? "Your library is empty." : "No matching ingredients found."}
                      </p>
                      {inventory.length === 0 && (
                        <button onClick={onAdd} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                          Add your first ingredient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-semibold px-2.5 py-1 rounded border border-green-200 dark:border-green-800">
                        Rs {item.pricePer50ml.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Edit Ingredient"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Ingredient"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IngredientsDashboard;