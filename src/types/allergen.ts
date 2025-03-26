import { Allergen } from '../constants/allergens';

export interface AllergenContainerProps {
  children: React.ReactNode;
}

export interface AllergenFormProps {
  availableAllergens: Allergen[];
  selectedAllergens: Allergen[];
  onToggleAllergen: (allergen: Allergen) => void;
  customAllergen: Allergen;
  setCustomAllergen: React.Dispatch<React.SetStateAction<Allergen>>;
  onAddCustomAllergen: () => void;
  customSuccess: string;
}

export interface AllergenFooterProps {
  loading: boolean;
  onSave: () => void;
  formError: string;
}
