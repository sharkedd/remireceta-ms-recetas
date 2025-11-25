import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Recipe } from './schemas/recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Ingredient } from 'src/ingredients/schemas/ingredient.schema';
@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Ingredient.name) private ingredientModel: Model<Ingredient>,
  ) {}

  // ====================================================================================
  // 🔥 UTILIDAD: Calcular calorías
  // ====================================================================================
  private async calculateCalories(ingredients: any[]): Promise<number> {
    let total = 0;

    for (const item of ingredients) {
      const ingredient = await this.ingredientModel
        .findById(item.ingredientId)
        .lean();

      if (!ingredient) {
        throw new RpcException({
          status: 404,
          message: `❌ Ingrediente con ID ${item.ingredientId} no existe`,
        });
      }

      if (!ingredient.caloriesPerUnit) continue;

      total += item.quantity * ingredient.caloriesPerUnit;
    }

    return total;
  }

  // ====================================================================================
  // 🟢 Crear receta
  // ====================================================================================
  async create(dto: CreateRecipeDto): Promise<Recipe> {
    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new RpcException({
        status: 400,
        message: '❌ La receta debe incluir al menos un ingrediente',
      });
    }

    // Validar ingredientes existentes
    for (const ing of dto.ingredients) {
      const exists = await this.ingredientModel.findById(ing.ingredientId);
      if (!exists) {
        throw new RpcException({
          status: 404,
          message: `❌ Ingrediente no encontrado: ${ing.ingredientId}`,
        });
      }
    }

    // Calcular calorías
    const calories = await this.calculateCalories(dto.ingredients);

    const recipe = new this.recipeModel({
      ...dto,
      calories,
    });

    console.log(`🍽️ Receta creada: ${recipe.title}`);

    return recipe.save();
  }

  // ====================================================================================
  // 🔍 Obtener todas las recetas
  // ====================================================================================
  async findAll(): Promise<Recipe[]> {
    const recipes = await this.recipeModel
      .find()
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipes || recipes.length === 0) {
      throw new RpcException({
        status: 404,
        message: '❌ No hay recetas registradas',
      });
    }

    return recipes;
  }

  // ====================================================================================
  // 🔍 Obtener receta por ID
  // ====================================================================================
  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipeModel
      .findById(id)
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipe) {
      throw new RpcException({
        status: 404,
        message: '❌ Receta no encontrada',
      });
    }

    return recipe;
  }

  // ====================================================================================
  // ✏️ Actualizar receta
  // ====================================================================================
  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.recipeModel.findById(id);

    if (!recipe) {
      throw new RpcException({
        status: 404,
        message: '❌ Receta no encontrada',
      });
    }

    // Validar ingredientes si vienen en la actualización
    if (dto.ingredients) {
      for (const ing of dto.ingredients) {
        const exists = await this.ingredientModel.findById(ing.ingredientId);
        if (!exists) {
          throw new RpcException({
            status: 404,
            message: `❌ Ingrediente no encontrado: ${ing.ingredientId}`,
          });
        }
      }

      // Recalcular calorías
      recipe.calories = await this.calculateCalories(dto.ingredients);
    }

    Object.assign(recipe, dto);

    console.log(`📝 Receta actualizada: ${recipe.title}`);

    return recipe.save();
  }

  // ====================================================================================
  // 🗑️ Eliminar receta
  // ====================================================================================
  async remove(id: string): Promise<Recipe> {
    const deleted = await this.recipeModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new RpcException({
        status: 404,
        message: '❌ Receta no encontrada',
      });
    }

    console.log(`🗑️ Receta eliminada: ${deleted.title}`);

    return deleted;
  }

  // ====================================================================================
  // 🔍 Buscar recetas que contengan ingredientes (ALL/ANY)
  // ====================================================================================
  async searchByIngredients(ingredients: string, mode: 'all' | 'any' = 'all') {
    if (!ingredients) {
      throw new RpcException({
        status: 400,
        message: '❌ Debes proporcionar al menos un ingrediente',
      });
    }

    const ingredientIds = ingredients.split(',');

    // Validar que los ingredientes existan
    const found = await this.ingredientModel
      .find({ _id: { $in: ingredientIds } })
      .exec();

    if (found.length !== ingredientIds.length) {
      throw new RpcException({
        status: 404,
        message: '❌ Uno o más ingredientes no existen',
      });
    }

    const query =
      mode === 'all'
        ? { 'ingredients.ingredientId': { $all: ingredientIds } }
        : { 'ingredients.ingredientId': { $in: ingredientIds } };

    const recipes = await this.recipeModel
      .find(query)
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: '❌ Ninguna receta coincide con los ingredientes buscados',
      });
    }

    return recipes;
  }

  // ====================================================================================
  // 🔍 Buscar por calorías máximas
  // ====================================================================================
  async searchByMaxCalories(max: number) {
    if (!max || max <= 0) {
      throw new RpcException({
        status: 400,
        message: '❌ El valor máximo de calorías es inválido',
      });
    }

    const recipes = await this.recipeModel
      .find({ calories: { $lte: max } })
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: `❌ No hay recetas con menos de ${max} calorías`,
      });
    }

    return recipes;
  }

  // ====================================================================================
  // 🔍 Buscar por rango de calorías
  // ====================================================================================
  async searchByCaloriesRange(min: number, max: number) {
    if (min == null || max == null || min < 0 || max <= 0 || min > max) {
      throw new RpcException({
        status: 400,
        message: '❌ Rango de calorías inválido',
      });
    }

    const recipes = await this.recipeModel
      .find({
        calories: {
          $gte: min,
          $lte: max,
        },
      })
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: `❌ No se encontraron recetas entre ${min} y ${max} calorías`,
      });
    }

    return recipes;
  }
}
