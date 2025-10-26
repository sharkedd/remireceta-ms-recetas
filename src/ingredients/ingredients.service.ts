import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient } from './schemas/ingredient.schema';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class IngredientsService {
  constructor(
    @InjectModel(Ingredient.name)
    private readonly ingredientModel: Model<Ingredient>,
  ) {}
  async create(createDto: CreateIngredientDto): Promise<Ingredient> {
    const exists = await this.ingredientModel.findOne({
      name: createDto.name.trim().toLowerCase(),
    });
    if (exists)
      throw new RpcException({
        status: 409,
        message: 'El ingrediente ya existe',
      });
    const newIngredient = new this.ingredientModel(createDto);
    return newIngredient.save();
  }
  async findAll(): Promise<Ingredient[]> {
    return this.ingredientModel.find().sort({ name: 1 }).exec();
  }
  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientModel.findById(id).exec();
    if (!ingredient)
      throw new RpcException({
        status: 404,
        message: 'Ingrediente no encontrado',
      });
    return ingredient;
  }
  async update(
    id: string,
    updateDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    const updated = await this.ingredientModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new RpcException({
        status: 404,
        message: 'Ingrediente no encontrado',
      });
    return updated;
  }
  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.ingredientModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new RpcException({
        status: 404,
        message: 'Ingrediente no encontrado',
      });
    return { message: 'Ingrediente eliminado correctamente' };
  }
}
