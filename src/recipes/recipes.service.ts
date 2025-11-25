import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Recipe } from './schemas/recipe.schema';
import { CreateRecipeMicroDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Ingredient } from 'src/ingredients/schemas/ingredient.schema';

type NormalizedIngredient = {
  ingredientId: string;
  quantity: number;
  unit?: string;
};

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Ingredient.name)
    private ingredientModel: Model<Ingredient & { _id: string }>,
  ) {}

  // ============================================================
  // 🔥 UTILIDAD: Calcular calorías
  // ============================================================
  private async calculateCalories(
    ingredients: NormalizedIngredient[],
  ): Promise<number> {
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

  // ============================================================
  // 🟢 Crear receta
  // ============================================================
  async create(dto: CreateRecipeMicroDto): Promise<Recipe> {
    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new RpcException({
        status: 400,
        message: '❌ La receta debe incluir al menos un ingrediente',
      });
    }

    const normalizedIngredients: NormalizedIngredient[] = [];

    for (const ing of dto.ingredients) {
      const ingredientDoc = await this.ingredientModel.findOne({
        name: ing.name,
      });

      if (!ingredientDoc) {
        throw new RpcException({
          status: 404,
          message: `❌ Ingrediente no encontrado: ${ing.name}`,
        });
      }

      normalizedIngredients.push({
        ingredientId: ingredientDoc.id, // string seguro
        quantity: ing.quantity,
        unit: ing.unit ?? ingredientDoc.unit,
      });
    }

    const calories = await this.calculateCalories(normalizedIngredients);

    const recipe = new this.recipeModel({
      ...dto,
      ingredients: normalizedIngredients, // aquí va la versión normalizada
      userId: dto.userId,
      calories,
    });

    console.log(`🍽️ Receta creada: ${recipe.title}`);

    return recipe.save();
  }

  // ============================================================
  // 🔍 Obtener todas las recetas
  // ============================================================
  async findAll(): Promise<Recipe[]> {
    const recipes = await this.recipeModel
      .find()
      .populate('ingredients.ingredientId')
      .exec();

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: '❌ No hay recetas registradas',
      });
    }

    return recipes;
  }

  // ============================================================
  // 🔍 Obtener receta por ID
  // ============================================================
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

  // ============================================================
  // ✏️ Actualizar receta
  // ============================================================
  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.recipeModel.findById(id);

    if (!recipe) {
      throw new RpcException({
        status: 404,
        message: '❌ Receta no encontrada',
      });
    }

    // Vamos a construir un "updateData" separado para no pelear con tipos del DTO
    const updateData: any = { ...dto };

    if (dto.ingredients) {
      const normalizedIngredients: NormalizedIngredient[] = [];

      for (const ing of dto.ingredients as any[]) {
        let ingredientDoc: (Ingredient & { _id: string }) | null = null;

        if (ing.name) {
          ingredientDoc = await this.ingredientModel.findOne({
            name: ing.name,
          });
        } else if (ing.ingredientId) {
          ingredientDoc = await this.ingredientModel.findById(ing.ingredientId);
        } else {
          throw new RpcException({
            status: 400,
            message:
              '❌ Cada ingrediente debe tener al menos "name" o "ingredientId"',
          });
        }

        if (!ingredientDoc) {
          throw new RpcException({
            status: 404,
            message: `❌ Ingrediente no encontrado: ${
              ing.name || ing.ingredientId
            }`,
          });
        }

        normalizedIngredients.push({
          ingredientId: ingredientDoc.id,
          quantity: ing.quantity,
          unit: ing.unit ?? ingredientDoc.unit,
        });
      }

      // usamos la versión normalizada SOLO para guardar y calcular, NO para cambiar el tipo del DTO
      updateData.ingredients = normalizedIngredients;
      recipe.calories = await this.calculateCalories(normalizedIngredients);
    }

    Object.assign(recipe, updateData);

    console.log(`📝 Receta actualizada: ${recipe.title}`);

    return recipe.save();
  }

  // ============================================================
  // 🗑️ Eliminar receta
  // ============================================================
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

  // ============================================================
  // 🔍 Buscar recetas por ingredientes (ALL / ANY)
  // ============================================================
  async searchByIngredients(ingredients: string, mode: 'all' | 'any' = 'all') {
    if (!ingredients) {
      throw new RpcException({
        status: 400,
        message: '❌ Debes proporcionar al menos un ingrediente',
      });
    }

    const ingredientIds = ingredients.split(',');

    const found = await this.ingredientModel.find({
      _id: { $in: ingredientIds },
    });

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
      .populate('ingredients.ingredientId');

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: '❌ Ninguna receta coincide con los ingredientes buscados',
      });
    }

    return recipes;
  }

  // ============================================================
  // 🔍 Buscar por calorías máximas
  // ============================================================
  async searchByMaxCalories(max: number) {
    if (!max || max <= 0) {
      throw new RpcException({
        status: 400,
        message: '❌ El valor máximo de calorías es inválido',
      });
    }

    const recipes = await this.recipeModel
      .find({ calories: { $lte: max } })
      .populate('ingredients.ingredientId');

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: `❌ No hay recetas con menos de ${max} calorías`,
      });
    }

    return recipes;
  }

  // ============================================================
  // 🔍 Buscar por rango de calorías
  // ============================================================
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
      .populate('ingredients.ingredientId');

    if (!recipes.length) {
      throw new RpcException({
        status: 404,
        message: `❌ No se encontraron recetas entre ${min} y ${max} calorías`,
      });
    }

    return recipes;
  }
}
