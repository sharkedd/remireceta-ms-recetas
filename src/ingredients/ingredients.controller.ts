import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Controller()
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @MessagePattern('createIngredient')
  create(@Payload() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @MessagePattern('findAllIngredients')
  findAll() {
    return this.ingredientsService.findAll();
  }

  @MessagePattern('findOneIngredient')
  findOne(@Payload() id: number) {
    return this.ingredientsService.findOne(id);
  }

  @MessagePattern('updateIngredient')
  update(@Payload() updateIngredientDto: UpdateIngredientDto) {
    return this.ingredientsService.update(updateIngredientDto.id, updateIngredientDto);
  }

  @MessagePattern('removeIngredient')
  remove(@Payload() id: number) {
    return this.ingredientsService.remove(id);
  }
}
