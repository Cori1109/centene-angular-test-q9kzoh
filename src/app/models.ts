/**
 * Represents an option in the autocomplete list
 *
 * @class
 * @property {string} label - Text that is displayed in the option list
 * @property {any}    value - Value that is sent in the field when the form is submitted
 * @property {string} name  - Secondary label that can be displyed on the right-hand side of the option
 * list (optional)
 */
export class Choice {
  label: string;
  value: any;
  name?: string;

  constructor(val: any, label?: string, name?: string) {
    this.value = val;
    this.label = label ? label : (val as string);
    this.name = name ? name : val;
  }
}

export type DrinkResponse = {
  drinks: Drink[];
};

export type Drink = {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate: string;
  strTags: string;
  strVideo: null;
  strCategory: string;
  strIBA: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strInstructionsES: string;
  strInstructionsDE: string;
  'strInstructionsZH-HANS': string;
  'strInstructionsZH-HANT': string;
  strDrinkThumb: string;
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
  strIngredient6: string;
  strIngredient7: string;
  strIngredient8: string;
  strIngredient9: string;
  strIngredient10: string;
  strIngredient11: string;
  strIngredient12: string;
  strIngredient13: string;
  strIngredient14: string;
  strIngredient15: string;
  strMeasure1: string;
  strMeasure2: string;
  strMeasure3: string;
  strMeasure4: string;
  strMeasure5: string;
  strMeasure6: string;
  strMeasure7: string;
  strMeasure8: string;
  strMeasure9: string;
  strMeasure10: string;
  strMeasure11: string;
  strMeasure12: string;
  strMeasure13: string;
  strMeasure14: string;
  strMeasure15: string;
  strImageSource: string;
  strImageAttribution: string;
  strCreativeCommonsConfirmed: string;
  dateModified: Date;
};
