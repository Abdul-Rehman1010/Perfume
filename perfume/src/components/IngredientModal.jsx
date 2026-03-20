import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const IngredientModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.pricePer50ml.toString());
    } else {
      setName('');
      setPrice('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && price) {
      onSave({
        id: initialData?.id || null,
        name: name.trim(),
        pricePer50ml: parseFloat(price)
      });
      setName('');
      setPrice('');
    }
  };

  const handleClose = () => {
    setName('');
    setPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Ingredient' : 'Add New Ingredient'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredient Name</label>
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g., Jasmine Extract"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Price per 50ml ($)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 45.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-3 mt-8 pt-2">
            <button 
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim() || !price}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {initialData ? 'Update Details' : 'Save Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;