import { IsNotEmpty } from 'class-validator';

export class FilterDto {
  @IsNotEmpty()
  searchTerm: string;

  @IsNotEmpty()
  pageNumber: number;

  @IsNotEmpty()
  pageSize: number;
}
