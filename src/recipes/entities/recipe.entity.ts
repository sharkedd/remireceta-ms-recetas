import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Recipe extends Document {
  @Prop()
  titulo: string;

  @Prop()
  categoria: string;

  @Prop()
  porciones: string; // <--- CONFIRMA QUE ESTO ESTÉ AQUÍ

  @Prop()
  instrucciones: string;

  @Prop()
  ingredientes: string[]; 

  @Prop()
  imagen: string;
  
  @Prop()
  calorias: string;

  @Prop()
  tiempo: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);