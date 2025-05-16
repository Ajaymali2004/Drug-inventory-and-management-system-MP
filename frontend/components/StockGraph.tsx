'use client';
import { useState, useEffect } from 'react';

interface StockData {
  drugId: number;
  quantity: number;
  timestamp: string;
}

interface StockGraphProps {
  userId: string;
  userName: string;
}

export default function StockGraph({ userId, userName }: StockGraphProps) {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<number>(1);

  const drugOptions = [
    { id: 1, name: 'Drug ID: 1' },
    { id: 2, name: 'Drug ID: 2' },
    { id: 3, name: 'Drug ID: 3' },
    { id: 4, name: 'Drug ID: 4' },
    { id: 5, name: 'Drug ID: 5' },
  ];

  useEffect(() => {
    fetchStockHistory();
  }, [selectedDrug]);

  const fetchStockHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/history/${userId}/${selectedDrug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  };

  // For demonstration, creating mock data points
  const generateMockDataPoints = () => {
    const points = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      points.push({
        date: date.toISOString().split('T')[0],
        quantity: Math.floor(Math.random() * 100) + 50
      });
    }
    return points;
  };

  const dataPoints = generateMockDataPoints();
  const maxQuantity = Math.max(...dataPoints.map(p => p.quantity));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{userName}'s Stock History</h3>
          <p className="text-sm text-gray-600">Last 30 days stock movement</p>
        </div>
        <select
          value={selectedDrug}
          onChange={(e) => setSelectedDrug(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {drugOptions.map((drug) => (
            <option key={drug.id} value={drug.id}>
              {drug.name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64 relative">
        <div className="absolute inset-0 flex items-end">
          {dataPoints.map((point, index) => (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center group"
            >
              <div className="relative flex-1 w-full">
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 bg-blue-500 rounded-t opacity-75 transition-all duration-300 group-hover:opacity-100"
                  style={{
                    height: `${(point.quantity / maxQuantity) * 100}%`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1">
                    {point.quantity} units
                  </div>
                </div>
              </div>
              {index % 5 === 0 && (
                <div className="text-xs text-gray-500 mt-2 rotate-45">
                  {point.date}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
