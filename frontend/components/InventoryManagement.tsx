import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Drug {
  drugId: number;
  quantity: number;
}

interface InventoryManagementProps {
  userRole: string;
  userId: string;
}

export default function InventoryManagement({ userRole, userId }: InventoryManagementProps) {
  const [inventory, setInventory] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateQuantity, setUpdateQuantity] = useState<{ [key: number]: number }>({});
  const router = useRouter();
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventory(data.inventory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (drugId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inventory/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          drugId,
          quantity: updateQuantity[drugId]
        })
      });
      
      if (!res.ok) throw new Error('Failed to update quantity');
      
      fetchInventory();
      setUpdateQuantity({ ...updateQuantity, [drugId]: 0 });
    } catch (err: any) {
      setError(err.message);
    }
  };

useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } 
  }, []);
  useEffect(() => {
    fetchInventory();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
      <div className="space-y-4">
        {inventory.map((drug) => (
          <div key={drug.drugId} className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Drug ID: {drug.drugId}</span>
                <p className="text-gray-600">Current Quantity: {drug.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={updateQuantity[drug.drugId] || ''}
                  onChange={(e) => setUpdateQuantity({
                    ...updateQuantity,
                    [drug.drugId]: parseInt(e.target.value) || 0
                  })}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder={userRole === 'supplier' ? "Add" : "Request"}
                />
                <button
                  onClick={() => handleUpdateQuantity(drug.drugId)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {userRole === 'supplier' ? 'Update' : 'Request'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
