import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { DeviceSeedService } from './device-seed.service';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity, UserEntity]), ConfigModule],
  providers: [DeviceSeedService],
  exports: [DeviceSeedService],
})
export class deviceSeedModule {}
