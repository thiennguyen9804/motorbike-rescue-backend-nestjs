import { forwardRef, Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    forwardRef(() => DevicesModule),
    forwardRef(() => MqttModule),
  ],
  providers: [SocketIoGateway],
  exports: [SocketIoGateway],
})
export class SocketIoModule {}
