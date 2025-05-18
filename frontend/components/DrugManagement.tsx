'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuantityModal from './QuantityModal';

interface Drug {
  drugId: number;
  name: string;
  quantity: number;
  lastUpdated: string;
}

interface DrugOption {
  id: number;
  name: string;
  count: number;
}

interface DrugManagementProps {
  userRole: string;
  userId: string;
}

export default function DrugManagement({ userRole, userId }: DrugManagementProps) {
  const [inventory, setInventory] = useState<Drug[]>([]);
  const [drugOptions, setDrugOptions] = useState<DrugOption[]>([
    { id: 1, name: 'Aspirin', count: 0 },
    { id: 2, name: 'Ibuprofen', count: 0 },
    { id: 3, name: 'Paracetamol', count: 0 },
    { id: 4, name: 'Amoxicillin', count: 0 },
    { id: 5, name: 'Metformin', count: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
  const [changeAmounts, setChangeAmounts] = useState<{ [key: number]: number }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [drugForModal, setDrugForModal] = useState<Drug | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      let updatedInventory = data.inventory || [];

      // Initialize missing drugs from drugOptions
      for (const drug of drugOptions) {
        if (!updatedInventory.some((item: Drug) => item.drugId === drug.id)) {
          await initializeDrug(drug.id, drug.name);
          updatedInventory.push({
            drugId: drug.id,
            name: drug.name,
            quantity: 0,
            lastUpdated: new Date().toISOString(),
          });
        }
      }

      // Sync drugOptions count with inventory
      setDrugOptions((prev) =>
        prev.map((drug) => ({
          ...drug,
          count: updatedInventory.find((item: Drug) => item.drugId === drug.id)?.quantity || 0,
        }))
      );
      setInventory(updatedInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setErrorMessage('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const initializeDrug = async (drugId: number, name: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          drugId,
          quantity: 0,
          name,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error initializing drug:', error);
    }
  };

  const updateQuantity = async (drugId: number, newQuantity: number) => {
    try {
      const token = localStorage.getItem('token');
      if (newQuantity < 0) {
        setErrorMessage('Stock cannot go below 0');
        return false;
      }

      // Optimistic update for inventory
      const originalInventory = [...inventory];
      setInventory((prev) =>
        prev.some((item) => item.drugId === drugId)
          ? prev.map((item) =>
              item.drugId === drugId ? { ...item, quantity: newQuantity } : item
            )
          : [
              ...prev,
              {
                drugId,
                name: drugOptions.find((d) => d.id === drugId)?.name || 'Unknown',
                quantity: newQuantity,
                lastUpdated: new Date().toISOString(),
              },
            ]
      );

      // Optimistic update for drugOptions count
      const originalDrugOptions = [...drugOptions];
      setDrugOptions((prev) =>
        prev.map((drug) =>
          drug.id === drugId ? { ...drug, count: newQuantity } : drug
        )
      );

      const response = await fetch('http://localhost:5000/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          drugId,
          quantity: newQuantity,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const data = await response.json();
      setInventory(data.inventory);
      // Sync drugOptions count with backend inventory
      setDrugOptions((prev) =>
        prev.map((drug) => ({
          ...drug,
          count: data.inventory.find((item: Drug) => item.drugId === drug.id)?.quantity || 0,
        }))
      );
      setErrorMessage(null);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      setErrorMessage('Failed to update stock');
      // Revert optimistic updates
      setInventory(originalInventory);
      setDrugOptions(originalDrugOptions);
      return false;
    }
  };

  const getDrugQuantity = (drugId: number) => {
    const drug = inventory.find((item) => item.drugId === drugId);
    return drug ? drug.quantity : 0;
  };

  const handleQuantityChange = async (drugId: number, newQuantity: number) => {
    return await updateQuantity(drugId, newQuantity);
  };

  const openModal = (drug: { id: number; name: string; count: number }) => {
    const quantity = getDrugQuantity(drug.id);
    setDrugForModal({
      drugId: drug.id,
      name: drug.name,
      quantity,
      lastUpdated: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDrugForModal(null);
    setChangeAmounts({});
    setErrorMessage(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Your current stock</h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex justify-evenly gap-8 flex-wrap">
          {drugOptions.map((drug) => (
            <motion.div key={drug.id} className="flex flex-col items-center space-y-4">
              <div
                className="flex flex-col items-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full w-36 h-36 justify-center cursor-pointer hover:scale-105 active:scale-95"
                onClick={() => openModal(drug)}
              >
                <p className="text-sm font-semibold">{drug.name}</p>
                <div className="text-2xl font-bold">{drug.count} units</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-600 text-center mt-4">{errorMessage}</div>
      )}

      {showModal && drugForModal && (
        <QuantityModal
          drug={drugForModal}
          changeAmounts={changeAmounts}
          setChangeAmounts={setChangeAmounts}
          handleQuantityChange={handleQuantityChange}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}