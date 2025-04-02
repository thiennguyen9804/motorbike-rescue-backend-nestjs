import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ConfigModule } from '@nestjs/config';
import { DevicesModule } from '../devices/devices.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SocketIoModule } from '../socket-io/socket-io.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    forwardRef(() => DevicesModule),
    forwardRef(() => SocketIoModule),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
