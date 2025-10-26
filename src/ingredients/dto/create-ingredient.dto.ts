import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  caloriesPerUnit?: number;
}
