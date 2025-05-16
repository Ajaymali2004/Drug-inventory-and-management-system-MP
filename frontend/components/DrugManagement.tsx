'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Drug {
  drugId: number;
  quantity: number;
  lastUpdated: string;
}

interface DrugManagementProps {
  userRole: string;
  userId: string;
}

export default function DrugManagement({ userRole, userId }: DrugManagementProps) {
  const [inventory, setInventory] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
  const [changeAmounts, setChangeAmounts] = useState<{ [key: number]: number }>({}); // Track amount for each drug
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error feedback

  const drugOptions = [
    { id: 1, name: 'Drug 1' },
    { id: 2, name: 'Drug 2' },
    { id: 3, name: 'Drug 3' },
    { id: 4, name: 'Drug 4' },
    { id: 5, name: 'Drug 5' },
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setInventory(data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (drugId: number, newQuantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          drugId,
          quantity: newQuantity,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const data = await response.json();
      setInventory(data.inventory);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getDrugQuantity = (drugId: number) => {
    const drug = inventory.find(item => item.drugId === drugId);
    return drug ? drug.quantity : 0;
  };

  const handleQuantityChange = (drugId: number, operation: 'add' | 'subtract') => {
    const currentQuantity = getDrugQuantity(drugId);
    const changeAmount = changeAmounts[drugId] || 0;
    const newQuantity = operation === 'add' 
      ? currentQuantity + changeAmount 
      : currentQuantity - changeAmount; 

    if (newQuantity >= 0) {
      setErrorMessage(null); // Clear any previous error message
      updateQuantity(drugId, newQuantity);
      setSelectedDrug(null); // Close the input fields after update
    } else {
      setErrorMessage('Stock cannot go below 0');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
        Your current stock
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex justify-evenly gap-8 flex-wrap">
          {drugOptions.map((drug) => (
            <motion.div 
              key={drug.id}
              className="flex flex-col items-center space-y-4"
            >
              <div
                className="flex flex-col items-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full w-36 h-36  justify-center cursor-pointer hover:scale-105 active:scale-95"
                onClick={() => setSelectedDrug(drug.id === selectedDrug ? null : drug.id)}
              >
                <p className="text-sm font-semibold">{`Drug ID: ${drug.id}`}</p>
                <div className="text-2xl font-bold">{getDrugQuantity(drug.id)} units</div>
              </div>

              {selectedDrug === drug.id && (
                <div className="flex justify-between items-center w-full mt-4 space-x-4">
                  <button
                    onClick={() => handleQuantityChange(drug.id, 'subtract')}
                    className="w-10 h-10 bg-red-600 rounded-lg text-white text-xl flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={changeAmounts[drug.id] || 0}
                    onChange={(e) => setChangeAmounts({ ...changeAmounts, [drug.id]: Number(e.target.value) })}
                    className="w-20 text-center p-2 border-2 border-indigo-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleQuantityChange(drug.id, 'add')}
                    className="w-10 h-10 bg-green-600 rounded-lg text-white text-xl flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-600 text-center mt-4">{errorMessage}</div>
      )}
    </div>
  );
}
