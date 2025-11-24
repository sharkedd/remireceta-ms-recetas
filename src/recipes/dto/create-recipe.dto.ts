export class CreateRecipeDto {
  titulo: string;
  categoria: string;
  porciones: string; // <--- AGREGADO
  ingredientes: string[];
  instrucciones: string;
  imagen: string;
}