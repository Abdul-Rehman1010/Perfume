import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);

  // ENFORCED RENDER-LEVEL SORTING
  const sortedOptions = [...options].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
  });

  const filteredOptions = sortedOptions.filter(opt => {
    const name = opt.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 sm:py-2 flex justify-between items-center cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate pr-4 ${selectedOption ? '' : 'text-gray-400'}`}>
          {selectedOption ? (renderOption ? renderOption(selectedOption) : selectedOption.name) : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <Search size={16} className="shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">No results found</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${value === opt.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm(''); 
                  }}
                >
                  <span className="truncate pr-4">{renderOption ? renderOption(opt) : opt.name}</span>
                  {value === opt.id && <Check size={16} className="shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;