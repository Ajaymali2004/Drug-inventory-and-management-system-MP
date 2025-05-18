import React, { useState } from 'react';

interface QuantityModalProps {
  drug: {
    drugId: number;
    name: string;
    quantity: number;
  };
  changeAmounts: { [key: number]: number };
  setChangeAmounts: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
  handleQuantityChange: (drugId: number, newQuantity: number) => Promise<boolean>;
  closeModal: () => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  drug,
  changeAmounts,
  setChangeAmounts,
  handleQuantityChange,
  closeModal,
}) => {
  const [error, setError] = useState<string | null>(null);
  const currentAmount = changeAmounts[drug.drugId] || 0;
  const newQuantity = drug.quantity + currentAmount;

  const handleButtonClick = (operation: 'add' | 'subtract') => {
    setError(null);
    const newAmount = operation === 'add' ? currentAmount + 1 : currentAmount - 1;
    if (drug.quantity + newAmount < 0) {
      setError('Stock cannot go below 0');
      return;
    }
    setChangeAmounts({ ...changeAmounts, [drug.drugId]: newAmount });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const newAmount = Number(e.target.value);
    if (isNaN(newAmount)) {
      setError('Invalid quantity');
      return;
    }
    if (drug.quantity + newAmount < 0) {
      setError('Stock cannot go below 0');
      return;
    }
    setChangeAmounts({ ...changeAmounts, [drug.drugId]: newAmount });
  };

  const handleSubmit = async () => {
    setError(null);
    const updatedQuantity = drug.quantity + currentAmount;

    if (updatedQuantity < 0) {
      setError('Stock cannot go below 0');
      return;
    }

    const success = await handleQuantityChange(drug.drugId, updatedQuantity);
    if (!success) {
      setError('Failed to update quantity');
    } else {
      setChangeAmounts({ ...changeAmounts, [drug.drugId]: 0 });
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-md  bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Adjust Quantity for {drug.name}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Current Stock: {drug.quantity} units
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => handleButtonClick('subtract')}
            disabled={newQuantity <= 0}
            className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-700 disabled:bg-gray-300 transition duration-200"
          >
            -
          </button>

          <input
            type="number"
            value={currentAmount}
            onChange={handleInputChange}
            className="w-24 text-center p-2 border-2 border-indigo-300 rounded-lg text-lg font-medium focus:outline-none focus:border-indigo-500"
            min="0"
          />

          <button
            onClick={() => handleButtonClick('add')}
            className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-green-700 transition duration-200"
          >
            +
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          New Stock: {newQuantity} units
        </p>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={newQuantity < 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;