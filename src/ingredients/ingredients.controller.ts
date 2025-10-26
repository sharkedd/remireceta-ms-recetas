import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
@Controller()
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  // 🟢 CREATE
  @MessagePattern({ cmd: 'create_ingredient' })
  create(@Payload() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }
  // 🔵 READ ALL
  @MessagePattern({ cmd: 'get_all_ingredients' })
  findAll() {
    return this.ingredientsService.findAll();
  }
  // 🟢 READ ONE
  @MessagePattern({ cmd: 'get_ingredient_by_id' })
  findOne(@Payload() id: string) {
    return this.ingredientsService.findOne(id);
  }
  // 🟣 UPDATE
  @MessagePattern({ cmd: 'update_ingredient' })
  update(@Payload() payload: { id: string; data: UpdateIngredientDto }) {
    return this.ingredientsService.update(payload.id, payload.data);
  }
  // 🔴 DELETE
  @MessagePattern({ cmd: 'delete_ingredient' })
  remove(@Payload() id: string) {
    return this.ingredientsService.remove(id);
  }
}
