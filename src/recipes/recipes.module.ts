import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe, RecipeSchema } from './entities/recipe.entity'; // O './schemas/recipe.schema'

@Module({
  imports: [
    // ESTA ES LA LÍNEA MÁGICA QUE FALTA:
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}