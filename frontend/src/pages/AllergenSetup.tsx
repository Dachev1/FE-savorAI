import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Allergen, COMMON_ALLERGENS } from '../constants/allergens';
import { AllergenContainerProps, AllergenFormProps, AllergenFooterProps } from '../types/allergen';

const AllergenSetup: React.FC = () => {
  const [availableAllergens, setAvailableAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [customAllergen, setCustomAllergen] = useState<Allergen>({ name: '' });
  const [customSuccess, setCustomSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    setAvailableAllergens(COMMON_ALLERGENS);
  }, []);

  const handleToggleAllergen = (allergen: Allergen) => {
    const alreadySelected = selectedAllergens.find((a) => a.name === allergen.name);
    if (alreadySelected) {
      setSelectedAllergens((prev) => prev.filter((a) => a.name !== allergen.name));
    } else {
      setSelectedAllergens((prev) => [...prev, allergen]);
    }
    setFormError('');
  };

  const handleAddCustomAllergen = () => {
    const nameTrimmed = customAllergen.name.trim();
    if (!nameTrimmed) {
      setFormError('Custom allergen name cannot be empty.');
      return;
    }
    setSelectedAllergens((prev) => [...prev, { ...customAllergen }]);
    setCustomAllergen({ name: '' });
    setFormError('');
    setCustomSuccess(`"${nameTrimmed}" was added! Save when you're ready.`);
    setTimeout(() => setCustomSuccess(''), 3000);
  };

  const handleSaveAllergens = () => {
    if (selectedAllergens.length === 0) {
      setFormError('Please select or add at least one allergen before saving.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-light to-accent p-4">
      <AllergenContainer>
        <AllergenHeader />
        <AllergenForm
          availableAllergens={availableAllergens}
          selectedAllergens={selectedAllergens}
          onToggleAllergen={handleToggleAllergen}
          customAllergen={customAllergen}
          setCustomAllergen={setCustomAllergen}
          onAddCustomAllergen={handleAddCustomAllergen}
          customSuccess={customSuccess}
        />
        <AllergenFooter loading={loading} onSave={handleSaveAllergens} formError={formError} />
      </AllergenContainer>
    </div>
  );
};

export default AllergenSetup;

const AllergenContainer: React.FC<AllergenContainerProps> = ({ children }) => (
  <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-xl hover:shadow-xl transition-all" data-aos="fade-up">
    {children}
  </div>
);

const AllergenHeader: React.FC = () => (
  <div className="text-center mb-6">
    <h2 className="text-3xl font-bold text-dark">Allergen Setup</h2>
    <p className="text-secondary mt-2">Tell us about any allergens you have.</p>
  </div>
);

const AllergenForm: React.FC<AllergenFormProps> = ({
  availableAllergens,
  selectedAllergens,
  onToggleAllergen,
  customAllergen,
  setCustomAllergen,
  onAddCustomAllergen,
  customSuccess,
}) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-secondary mb-2">Common Allergens</label>
      <div className="flex flex-wrap gap-2">
        {availableAllergens.map((allergen) => {
          const isSelected = selectedAllergens.some((a) => a.name === allergen.name);
          return (
            <button
              key={allergen.name}
              type="button"
              onClick={() => onToggleAllergen(allergen)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-300 text-dark hover:bg-gray-200'
              }`}
            >
              {allergen.name}
            </button>
          );
        })}
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-secondary mb-2">Add a custom allergen or disliked ingredient</label>
      <input
        type="text"
        value={customAllergen.name}
        onChange={(e) => setCustomAllergen({ ...customAllergen, name: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Name"
      />
      <textarea
        value={customAllergen.description || ''}
        onChange={(e) =>
          setCustomAllergen({
            ...customAllergen,
            description: e.target.value,
          })
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="Description (optional)"
        rows={2}
      />
      <button
        type="button"
        onClick={onAddCustomAllergen}
        className="mt-2 px-4 py-2 bg-accent text-white font-semibold rounded-full shadow hover:bg-dark transition-transform"
      >
        Add Custom
      </button>
      {customSuccess && <p className="mt-2 text-green-600 font-semibold animate-pulse">{customSuccess}</p>}
    </div>
  </div>
);

const AllergenFooter: React.FC<AllergenFooterProps> = ({ onSave, loading, formError }) => (
  <div className="text-center mt-6">
    {formError && <p className="mb-4 text-red-500 font-semibold">{formError}</p>}
    <button
      type="button"
      onClick={onSave}
      disabled={loading}
      className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform"
    >
      {loading ? 'Saving...' : 'Save'}
    </button>
  </div>
);
