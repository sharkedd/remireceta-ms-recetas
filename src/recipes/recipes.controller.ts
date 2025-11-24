import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @MessagePattern({ cmd: 'create_recipe' })
  create(@Payload() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @MessagePattern({ cmd: 'get_all_recipes' })
  findAll() {
    return this.recipesService.findAll();
  }

  @MessagePattern({ cmd: 'find_recipe_by_id' })
  findOne(@Payload() id: string) { // <--- CAMBIO: number a string
    return this.recipesService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_recipe' })
  update(@Payload() updateRecipeDto: UpdateRecipeDto) {
    // Convertimos el ID a string para asegurar compatibilidad con Mongo
    // Aunque el DTO diga number, en tiempo de ejecución llegará lo que mande el Gateway
    const id = String(updateRecipeDto.id); 
    return this.recipesService.update(id, updateRecipeDto);
  }

  @MessagePattern({ cmd: 'remove_recipe' })
  remove(@Payload() id: string) { // <--- CAMBIO: number a string
    return this.recipesService.remove(id);
  }
}