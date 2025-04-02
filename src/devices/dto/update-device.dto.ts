// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';

export class UpdatedeviceDto extends PartialType(CreateDeviceDto) {}
export class UpdateDevicePinDto {
  id: number;
}
export class UpdateDeviceSensorDto extends UpdateDevicePinDto {
  id: number;
}
