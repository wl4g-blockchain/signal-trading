import { ComponentSchema } from '../types';

export const getCategoryLocalizedName = (schema: ComponentSchema, language: string = 'en'): string => {
  return language === 'zh' ? schema.categoryCN : schema.category;
};

export const getComponentLocalizedName = (schema: ComponentSchema, language: string = 'en'): string => {
  return language === 'zh' ? schema.nameCN : schema.name;
};

export const getComponentLocalizedDescription = (schema: ComponentSchema, language: string = 'en'): string => {
  return language === 'zh' ? schema.descriptionCN : schema.description;
};
