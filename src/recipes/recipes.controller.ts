import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @MessagePattern('createRecipe')
  create(@Payload() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @MessagePattern('findAllRecipes')
  findAll() {
    return this.recipesService.findAll();
  }

  @MessagePattern('findOneRecipe')
  findOne(@Payload() id: number) {
    return this.recipesService.findOne(id);
  }

  @MessagePattern('updateRecipe')
  update(@Payload() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(updateRecipeDto.id, updateRecipeDto);
  }

  @MessagePattern('removeRecipe')
  remove(@Payload() id: number) {
    return this.recipesService.remove(id);
  }
}
