import React from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';

const IngredientsDashboard = ({ inventory, onBack, onAdd, onEdit, onDelete }) => {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Ingredients Library</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage your available stock and pricing</p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 sm:py-2 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          New Ingredient
        </button>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 transition-colors">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm sm:text-base">Ingredient Name</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 w-32 sm:w-48 text-sm sm:text-base">Price per 50ml</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-gray-600 dark:text-gray-300 w-24 sm:w-32 text-right text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-12 text-gray-500 dark:text-gray-400 px-4">
                    No ingredients found. Add your first one!
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{item.name}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-medium text-sm sm:text-base">Rs {item.pricePer50ml.toFixed(2)}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 flex justify-end gap-1 sm:gap-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 sm:p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        <Edit size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
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