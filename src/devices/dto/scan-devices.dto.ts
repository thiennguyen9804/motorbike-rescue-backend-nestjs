import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceStatusStr } from '../domain/device-status.enum';

export class ScanDevicesDto {
  @ApiProperty({
    description: 'Latitude of the device',
    example: 37.774929,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    type: String,
    description: 'Device status (offline/online)',
    default: DeviceStatusStr.ONLINE,
    example: DeviceStatusStr.ONLINE,
    enum: [DeviceStatusStr.OFFLINE, DeviceStatusStr.ONLINE]
  })
  @IsString()
  @IsEnum(DeviceStatusStr)
  @IsOptional()
  status?: DeviceStatusStr;

  @ApiProperty({
    description: 'Longitude of the device',
    example: -122.419416,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Radius default is 10000, admin can scan up to 100000',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(1000000)
  radius: number = 10000;
}
