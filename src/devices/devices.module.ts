import { Module, forwardRef } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { SocketIoModule } from '../socket-io/socket-io.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity]),
    AuthModule,
    UsersModule,
    forwardRef(() => MqttModule),
    forwardRef(() => SocketIoModule),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService, TypeOrmModule],
})
export class DevicesModule {}
