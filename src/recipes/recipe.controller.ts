import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecipeService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller()
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  // ✔ Crear receta
  @MessagePattern({ cmd: 'create_recipe' })
  create(@Payload() dto: CreateRecipeDto) {
    return this.recipeService.create(dto);
  }

  // ✔ Obtener todas las recetas
  @MessagePattern({ cmd: 'find_all_recipes' })
  findAll() {
    return this.recipeService.findAll();
  }

  // ✔ Obtener una receta por ID
  @MessagePattern({ cmd: 'find_recipe' })
  findOne(@Payload() id: string) {
    return this.recipeService.findOne(id);
  }

  // ✔ Actualizar receta
  @MessagePattern({ cmd: 'update_recipe' })
  update(@Payload() data: { id: string; dto: UpdateRecipeDto }) {
    return this.recipeService.update(data.id, data.dto);
  }

  // ✔ Eliminar receta
  @MessagePattern({ cmd: 'remove_recipe' })
  remove(@Payload() id: string) {
    return this.recipeService.remove(id);
  }

  // ✔ Buscar recetas que contengan ingredientes (ALL o ANY)
  @MessagePattern({ cmd: 'search_recipes_by_ingredients' })
  searchByIngredients(
    @Payload()
    data: {
      ingredients: string; // IDs separados por coma
      mode?: 'all' | 'any';
    },
  ) {
    return this.recipeService.searchByIngredients(
      data.ingredients,
      data.mode ?? 'all',
    );
  }

  // ✔ Buscar recetas por calorías máximas
  @MessagePattern({ cmd: 'search_recipes_by_max_calories' })
  searchByMaxCalories(@Payload() max: number) {
    return this.recipeService.searchByMaxCalories(max);
  }

  // ✔ Buscar recetas por rango de calorías
  @MessagePattern({ cmd: 'search_recipes_by_calories_range' })
  searchByCaloriesRange(@Payload() data: { min: number; max: number }) {
    return this.recipeService.searchByCaloriesRange(data.min, data.max);
  }
}
