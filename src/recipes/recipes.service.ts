import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity'; // Ojo: Verifica si es entities o schemas

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @InjectModel(Recipe.name) private readonly recipeModel: Model<Recipe>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    this.logger.log('Creating new recipe...');
    const createdRecipe = new this.recipeModel(createRecipeDto);
    return await createdRecipe.save();
  }

  async findAll() {
    return await this.recipeModel.find().exec();
  }

  async findOne(id: string) { // Cambié number por string porque Mongo usa strings
    return await this.recipeModel.findById(id).exec();
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    return await this.recipeModel.findByIdAndUpdate(id, updateRecipeDto, { new: true }).exec();
  }

  async remove(id: string) {
    return await this.recipeModel.findByIdAndDelete(id).exec();
  }
}