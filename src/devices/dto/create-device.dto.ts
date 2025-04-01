import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PostGISPoint } from '../../database/types/postgis.types';


export class CreateDeviceDto {
  @ApiProperty({
    type: String,
    description: 'Device name',
    example: 'My Device',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Device status (1 for ONLINE)',
    default: 1,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiProperty({
    type: Number,
    description: 'Associated user ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
