import {
  // common
  Module,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class devicesModule {}
