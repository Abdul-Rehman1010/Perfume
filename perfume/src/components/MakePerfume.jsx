import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Save, Undo2, CheckCircle2, AlertCircle, Beaker } from 'lucide-react';

const MakePerfume = ({ formula, targetVolume, existingBatch, isReadOnly = false, onBack, onSave }) => {
  const [currentTarget, setCurrentTarget] = useState(existingBatch ? existingBatch.targetVolume : targetVolume);
  const [targetInput, setTargetInput] = useState((existingBatch ? existingBatch.targetVolume : targetVolume).toString());
  
  const [ingredientsProgress, setIngredientsProgress] = useState(() => {
    if (existingBatch) {
      return existingBatch.ingredientsLog;
    }
    return formula.formula.map(ing => ({
      ingredientId: ing.ingredientId,
      name: ing.name,
      loggedAmount: 0
    }));
  });
  
  const [historyStack, setHistoryStack] = useState([]);
  const [inputAmounts, setInputAmounts] = useState({});

  const displayProgress = useMemo(() => {
    return ingredientsProgress.map(ing => {
      const formulaItem = formula.formula.find(f => f.ingredientId === ing.ingredientId);
      const basePct = formulaItem ? (formulaItem.amount / formula.totalVolume) : 0;
      
      const targetAmount = Math.round(currentTarget * basePct * 10) / 10; 
      
      return {
        ...ing,
        targetAmount,
        basePct
      };
    });
  }, [ingredientsProgress, formula, currentTarget]);

  const handleTargetBlur = () => {
    let requestedTarget = parseFloat(targetInput);
    if (isNaN(requestedTarget) || requestedTarget < 0.1) {
      setTargetInput(currentTarget.toString());
      return;
    }

    let minAllowedTarget = 0;
    displayProgress.forEach(ing => {
      if (ing.loggedAmount > 0 && ing.basePct > 0) {
        const requiredBatchForThisPour = ing.loggedAmount / ing.basePct;
        if (requiredBatchForThisPour > minAllowedTarget) {
          minAllowedTarget = requiredBatchForThisPour;
        }
      }
    });

    minAllowedTarget = Math.ceil(minAllowedTarget * 10) / 10;

    if (requestedTarget < minAllowedTarget) {
      alert(`Cannot reduce batch size below ${minAllowedTarget}ml. You have already poured ingredients that demand at least this size to maintain the correct formula percentages.`);
      setTargetInput(minAllowedTarget.toString());
      setCurrentTarget(minAllowedTarget);
    } else {
      setCurrentTarget(requestedTarget);
    }
  };

  const handleAddAmount = (ingredientId, amountStr) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const currentIng = ingredientsProgress.find(i => i.ingredientId === ingredientId);
    const newLoggedAmount = currentIng.loggedAmount + amount;

    const formulaItem = formula.formula.find(f => f.ingredientId === ingredientId);
    const basePct = formulaItem.amount / formula.totalVolume;
    const currentRoundedTarget = Math.round(currentTarget * basePct * 10) / 10;

    let newTarget = currentTarget;

    if (newLoggedAmount > currentRoundedTarget) {
      const requiredTarget = newLoggedAmount / basePct;
      const roundedRequired = Math.ceil(requiredTarget * 10) / 10;
      if (roundedRequired > newTarget) {
        newTarget = roundedRequired;
      }
    }

    setIngredientsProgress(prev => prev.map(ing => 
      ing.ingredientId === ingredientId 
        ? { ...ing, loggedAmount: newLoggedAmount } 
        : ing
    ));

    if (newTarget !== currentTarget) {
      setCurrentTarget(newTarget);
      setTargetInput(newTarget.toString());
    }

    setHistoryStack(prev => [...prev, { ingredientId, amount, previousTarget: currentTarget }]);
    setInputAmounts(prev => ({ ...prev, [ingredientId]: '' }));
  };

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) return;
    
    const lastAction = historyStack[historyStack.length - 1];
    
    setIngredientsProgress(prev => prev.map(ing => 
      ing.ingredientId === lastAction.ingredientId 
        ? { ...ing, loggedAmount: Math.max(0, ing.loggedAmount - lastAction.amount) } 
        : ing
    ));

    if (lastAction.previousTarget !== currentTarget) {
      setCurrentTarget(lastAction.previousTarget);
      setTargetInput(lastAction.previousTarget.toString());
    }
    
    setHistoryStack(prev => prev.slice(0, -1));
  }, [historyStack, currentTarget]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isReadOnly) return; 
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, isReadOnly]);

  const isFullyComplete = useMemo(() => {
    if (displayProgress.length === 0) return false;
    return displayProgress.every(ing => ing.loggedAmount >= (ing.targetAmount - 0.01));
  }, [displayProgress]);

  const currentTotalVolume = useMemo(() => {
    return displayProgress.reduce((sum, ing) => sum + ing.loggedAmount, 0);
  }, [displayProgress]);

  const handleSaveAndExit = (forceComplete = false) => {
    if (isReadOnly) {
      onBack();
      return;
    }

    const status = (isFullyComplete || forceComplete) ? 'Completed' : 'In Progress';
    
    const dataToSave = {
      _id: existingBatch?._id || null,
      formulaId: formula._id,
      formulaName: formula.name,
      targetVolume: currentTarget,
      status: status,
      ingredientsLog: displayProgress.map(ing => ({
        ingredientId: ing.ingredientId,
        name: ing.name,
        targetAmount: ing.targetAmount,
        loggedAmount: ing.loggedAmount
      }))
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => isReadOnly ? onBack() : handleSaveAndExit(false)} 
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0"
            title={isReadOnly ? "Go Back" : "Save and Go Back"}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formula.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Target Batch (ml):</span>
              <input
                type="number"
                step="0.1"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onBlur={handleTargetBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                disabled={isReadOnly}
                className={`w-24 px-2 py-1 text-sm font-semibold border rounded outline-none transition-colors ${
                  isReadOnly 
                    ? 'border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' 
                    : 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500'
                }`}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">| Poured: <span className="font-semibold text-gray-900 dark:text-white">{currentTotalVolume.toFixed(1)} ml</span></span>
            </div>
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="flex-1 md:flex-none bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 disabled:opacity-50 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Undo2 size={18} /> <span className="hidden sm:inline">Undo (Ctrl+Z)</span>
            </button>
            <button 
              onClick={() => handleSaveAndExit(isFullyComplete)}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Save size={18} /> Save Progress
            </button>
          </div>
        )}
      </header>

      {isReadOnly && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={24} className="shrink-0" />
          <p className="font-medium">The original formula for this batch was deleted. This log is permanently read-only.</p>
        </div>
      )}

      {isFullyComplete && !isReadOnly && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={24} className="shrink-0" />
          <p className="font-medium">All ingredients have reached their target amounts! Batch is complete.</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Ingredient</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Target (ml)</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm w-[40%]">Progress</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Log Amount (ml)</th>
              </tr>
            </thead>
            <tbody>
              {displayProgress.map(ing => {
                const isComplete = ing.loggedAmount >= (ing.targetAmount - 0.01);
                const progressBarPct = ing.targetAmount === 0 ? 100 : Math.min((ing.loggedAmount / ing.targetAmount) * 100, 100);
                
                const requiredPct = (ing.basePct * 100).toFixed(1);
                const achievedPct = currentTarget > 0 ? ((ing.loggedAmount / currentTarget) * 100).toFixed(1) : 0;
                
                // NEW: Calculate the exact remaining amount needed to reach the target
                const remainingNeeded = Math.max(0, ing.targetAmount - ing.loggedAmount);
                
                return (
                  <tr key={ing.ingredientId} className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${isComplete ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {isComplete && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {ing.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">
                      <div>{ing.targetAmount.toFixed(1)} ml</div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{requiredPct}% required</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${progressBarPct}%` }}
                          ></div>
                        </div>
                        <div className="flex flex-col items-end w-28">
                          <span className={`text-sm font-medium ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {ing.loggedAmount.toFixed(1)} / {ing.targetAmount.toFixed(1)} ml
                          </span>
                          <span className={`text-xs mt-0.5 ${isComplete ? 'text-emerald-500' : 'text-gray-500'}`}>
                            {achievedPct}% achieved
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {!isReadOnly ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              step="0.1"
                              min="0.1"
                              placeholder="ml"
                              value={inputAmounts[ing.ingredientId] || ''}
                              onChange={(e) => setInputAmounts(prev => ({...prev, [ing.ingredientId]: e.target.value}))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddAmount(ing.ingredientId, inputAmounts[ing.ingredientId])}
                              className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <button 
                              onClick={() => handleAddAmount(ing.ingredientId, inputAmounts[ing.ingredientId])}
                              disabled={!inputAmounts[ing.ingredientId]}
                              className="bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                              Add
                            </button>
                          </div>
                          {/* NEW: Displays the remaining amount to add under the input field */}
                          {!isComplete && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              Needs {remainingNeeded.toFixed(1)} ml more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-sm font-medium">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MakePerfume;