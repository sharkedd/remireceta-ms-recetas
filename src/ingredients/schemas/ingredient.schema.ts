import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ingredient extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string; // "Tomate", "Aceite de oliva"

  @Prop({ required: false })
  unit?: string; // "gramos", "ml", "unidad", etc.

  @Prop({ required: false })
  caloriesPerUnit?: number; // ej: 20 kcal por 100g o unidad
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

// Búsquedas rápidas por nombre y tags
IngredientSchema.index({ name: 'text', category: 'text' });
IngredientSchema.index({ tags: 1 });
