import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  tags?: string[] = [];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  caloriesPerUnit?: number;
}
