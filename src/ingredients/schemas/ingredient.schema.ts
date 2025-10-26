import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ingredient extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string; // "Tomate", "Aceite de oliva"

  @Prop({ type: [String], default: [] })
  tags: string[]; // ["vegetariano", "sin_gluten", "vegano"]

  @Prop({ required: false })
  category?: string; // "Verdura", "Lácteo", "Proteína", etc.

  @Prop({ required: false })
  unit?: string; // "gramos", "ml", "unidad", etc.

  @Prop({ required: false })
  caloriesPerUnit?: number; // ej: 20 kcal por 100g o unidad
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

// Búsquedas rápidas por nombre y tags
IngredientSchema.index({ name: 'text', tags: 1, category: 1 });
