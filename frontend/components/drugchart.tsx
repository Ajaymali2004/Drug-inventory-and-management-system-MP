import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const mockDrugHistory = [
  { drugName: 'Paracetamol', month: 'Jan', quantityAdded: 500, quantityUsed: 300 },
  { drugName: 'Paracetamol', month: 'Feb', quantityAdded: 400, quantityUsed: 250 },
  { drugName: 'Paracetamol', month: 'Mar', quantityAdded: 450, quantityUsed: 320 },

  { drugName: 'Ibuprofen', month: 'Jan', quantityAdded: 300, quantityUsed: 150 },
  { drugName: 'Ibuprofen', month: 'Feb', quantityAdded: 350, quantityUsed: 200 },
  { drugName: 'Ibuprofen', month: 'Mar', quantityAdded: 400, quantityUsed: 220 },

  { drugName: 'Amoxicillin', month: 'Jan', quantityAdded: 200, quantityUsed: 100 },
  { drugName: 'Amoxicillin', month: 'Feb', quantityAdded: 300, quantityUsed: 180 },
  { drugName: 'Amoxicillin', month: 'Mar', quantityAdded: 250, quantityUsed: 160 },
];

const DrugChart = () => {
  const drugNames = [...new Set(mockDrugHistory.map((d) => d.drugName))];

  return (
    <div className="w-full h-[500px]">
      <h2 className="text-xl font-semibold mb-4">Drug Inventory Usage Over Months</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Lines for Quantity Added */}
          {drugNames.map((drugName, index) => (
            <Line
              key={`${drugName}-added`}
              type="monotone"
              dataKey="quantityAdded"
              data={mockDrugHistory.filter((d) => d.drugName === drugName)}
              name={`${drugName} - Added`}
              stroke={pieColors[index % pieColors.length]}
              dot={{ r: 3 }}
            />
          ))}

          {/* Lines for Quantity Used */}
          {drugNames.map((drugName, index) => (
            <Line
              key={`${drugName}-used`}
              type="monotone"
              dataKey="quantityUsed"
              data={mockDrugHistory.filter((d) => d.drugName === drugName)}
              name={`${drugName} - Used`}
              stroke={pieColors[(index + 3) % pieColors.length]}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DrugChart;
