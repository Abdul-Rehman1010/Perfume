import React from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';

const IngredientsDashboard = ({ inventory, onBack, onAdd, onEdit, onDelete }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col min-h-screen">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ingredients Library</h1>
            <p className="text-sm text-gray-500">Manage your available stock and pricing</p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          New Ingredient
        </button>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 font-semibold text-gray-600">Ingredient Name</th>
              <th className="py-4 px-6 font-semibold text-gray-600 w-48">Price per 50ml</th>
              <th className="py-4 px-6 font-semibold text-gray-600 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-12 text-gray-500">
                  No ingredients found. Add your first one!
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
                  <td className="py-4 px-6 text-emerald-600 font-medium">${item.pricePer50ml.toFixed(2)}</td>
                  <td className="py-4 px-6 flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngredientsDashboard;