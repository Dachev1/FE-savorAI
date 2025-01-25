import React, {
  useState,
  useRef,
  useEffect,
  DragEvent,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

/** -----------------------------
 *  Types & Interfaces
 * ----------------------------- */
interface IFormErrors {
  mealName?: string;
  ingredientsUsed?: string;
  recipeDetails?: string;
}

interface IRecipeFormData {
  mealName: string;
  ingredientsUsed: string[];
  recipeDetails: string;
  imageFile: File | null;
}

/** -----------------------------
 *  Validation Helper
 * ----------------------------- */
function validateForm(formData: IRecipeFormData): IFormErrors {
  const newErrors: IFormErrors = {};

  if (!formData.mealName.trim()) {
    newErrors.mealName = 'Meal Name is required.';
  }

  if (formData.ingredientsUsed.length === 0) {
    newErrors.ingredientsUsed = 'At least one ingredient is required.';
  }

  if (!formData.recipeDetails.trim()) {
    newErrors.recipeDetails = 'Recipe details are required.';
  }

  return newErrors;
}

/** -----------------------------
 *  Main Component
 * ----------------------------- */
const RecipeCreate: React.FC = () => {
  // Form states
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<IFormErrors>({});

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  /**
   * Handle final form submission
   */
  const handleCreateRecipe = () => {
    const formData: IRecipeFormData = {
      mealName,
      ingredientsUsed,
      recipeDetails,
      imageFile,
    };

    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      console.log('New Recipe Created:', formData);
      // Perform your form submission logic here (e.g. API call)
    }
  };

  /**
   * Update state when user selects an image
   */
  const handleFileSelection = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * Add a new ingredient to the list
   */
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredientsUsed((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  /**
   * Remove an ingredient from the list
   */
  const handleRemoveIngredient = (index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <div
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        data-aos="fade-up"
      >
        <HeaderSection />
        <form className="space-y-6">
          <TextInput
            label="Meal Name"
            id="mealName"
            value={mealName}
            setValue={setMealName}
            error={errors.mealName}
            placeholder="e.g. Spiced Chicken Rice Pilaf"
          />

          <IngredientsInput
            ingredientsUsed={ingredientsUsed}
            newIngredient={newIngredient}
            setNewIngredient={setNewIngredient}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            error={errors.ingredientsUsed}
          />

          <TextArea
            label="Recipe Details"
            id="recipeDetails"
            value={recipeDetails}
            setValue={setRecipeDetails}
            error={errors.recipeDetails}
            placeholder="Describe the preparation steps..."
          />

          <DragDropImageInput
            imagePreview={imagePreview}
            onFileSelect={handleFileSelection}
          />

          <button
            type="button"
            onClick={handleCreateRecipe}
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Recipe
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreate;

/** ----------------------------------------------------------------------------
 *  Subcomponent: Section Header
 * ----------------------------------------------------------------------------*/
const HeaderSection: React.FC = () => (
  <div className="text-center mb-6">
    <h2 className="text-3xl font-bold text-dark transition-colors duration-300 hover:text-accent">
      Create a New Recipe
    </h2>
    <p className="text-secondary">Share your delicious creation!</p>
  </div>
);

/** ----------------------------------------------------------------------------
 *  Subcomponent: TextInput for Meal Name (or any single-line text)
 * ----------------------------------------------------------------------------*/
interface TextInputProps {
  label: string;
  id: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  id,
  value,
  setValue,
  error,
  placeholder,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium transition-colors ${
          value ? 'text-accent' : 'text-secondary'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`mt-1 w-full px-4 py-3 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>}
    </div>
  );
};

/** ----------------------------------------------------------------------------
 *  Subcomponent: TextArea for recipe details
 * ----------------------------------------------------------------------------*/
interface TextAreaProps {
  label: string;
  id: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
  placeholder?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  value,
  setValue,
  error,
  placeholder,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium transition-colors ${
          value ? 'text-accent' : 'text-secondary'
        }`}
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`mt-1 w-full px-4 py-3 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>}
    </div>
  );
};

/** ----------------------------------------------------------------------------
 *  Subcomponent: Ingredients Input + List
 * ----------------------------------------------------------------------------*/
interface IngredientsInputProps {
  ingredientsUsed: string[];
  newIngredient: string;
  setNewIngredient: React.Dispatch<React.SetStateAction<string>>;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  error?: string;
}

const IngredientsInput: React.FC<IngredientsInputProps> = ({
  ingredientsUsed,
  newIngredient,
  setNewIngredient,
  onAddIngredient,
  onRemoveIngredient,
  error,
}) => {
  /** Add ingredient on Enter key */
  const handleIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddIngredient();
    }
  };

  return (
    <div>
      <label
        htmlFor="ingredientsUsed"
        className={`block text-sm font-medium transition-colors ${
          ingredientsUsed.length > 0 ? 'text-accent' : 'text-secondary'
        }`}
      >
        Ingredients
      </label>
      <div className="flex mt-1 space-x-2">
        <input
          id="ingredientsUsed"
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyDown={handleIngredientKeyDown}
          className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Type an ingredient and press Enter or +"
        />
        <button
          type="button"
          onClick={onAddIngredient}
          className="px-5 py-3 bg-accent text-white font-semibold rounded-lg shadow-lg transform transition-transform active:scale-95 hover:bg-dark"
        >
          +
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-3">
        {ingredientsUsed.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center bg-accent text-white px-3 py-1 rounded-full text-sm shadow-md hover:bg-dark transition-colors"
          >
            <span>{ingredient}</span>
            <button
              type="button"
              onClick={() => onRemoveIngredient(index)}
              className="ml-2 text-xs bg-white text-accent rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/** ----------------------------------------------------------------------------
 *  Subcomponent: Drag and Drop Image Input
 * ----------------------------------------------------------------------------*/
interface DragDropImageInputProps {
  imagePreview: string | null;
  onFileSelect: (file: File) => void;
}

const DragDropImageInput: React.FC<DragDropImageInputProps> = ({
  imagePreview,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
      e.dataTransfer.clearData();
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
        isDragging
          ? 'border-accent bg-blue-50'
          : 'border-dashed border-gray-300 hover:border-accent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickUpload}
    >
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg mb-2 shadow-md transform hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <p className="text-secondary text-sm transition-colors">
          {isDragging ? 'Drop the image here...' : 'Drag & Drop an image, or click to select.'}
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
