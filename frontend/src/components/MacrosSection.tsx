import React from 'react';
import { IMacros } from '../types/IMacros';

interface MacrosSectionProps {
  macros: IMacros;
  onChange: (field: keyof IMacros, value: string) => void;
}

const MacrosSection: React.FC<MacrosSectionProps> = ({ macros, onChange }) => {
  const rows = [
    { label: 'Calories', field: 'calories', placeholder: 'e.g. 200' },
    { label: 'Protein (g)', field: 'protein', placeholder: 'e.g. 15' },
    { label: 'Carbs (g)', field: 'carbs', placeholder: 'e.g. 30' },
    { label: 'Fat (g)', field: 'fat', placeholder: 'e.g. 10' },
  ];

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow transition-all duration-500 ease-in-out fade-in">
      <h3 className="text-lg font-bold text-dark mb-2">Macros</h3>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-2">Nutrient</th>
            <th className="px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.field} className="bg-white border-b">
              <td className="px-4 py-2 font-medium text-gray-900">{item.label}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  value={macros[item.field as keyof IMacros]}
                  onChange={(e) => onChange(item.field as keyof IMacros, e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  placeholder={item.placeholder}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MacrosSection;
