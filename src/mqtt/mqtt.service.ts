import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';
import { error, info } from 'ps-logger';
import { DevicesService } from '../devices/devices.service';
import { DeviceEntity } from '../devices/infrastructure/persistence/relational/entities/device.entity';

@Injectable()
export class MqttService implements OnModuleInit {
  private mqttClient: MqttClient;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => DevicesService))
    private deviceService: DevicesService,
  ) {}

  onModuleInit() {
    const clientId = `mqtt_${crypto.randomUUID()}`;
    const mqttHost = this.configService.getOrThrow<string>('app.mqttHost', {
      infer: true,
    });
    const mqttPort = this.configService.getOrThrow<number>('app.mqttPort', {
      infer: true,
    });
    const mqttUser = this.configService.getOrThrow<string>('app.mqttUser', {
      infer: true,
    });
    const mqttPass = this.configService.getOrThrow<string>('app.mqttPass', {
      infer: true,
    });

    this.mqttClient = connect({
      host: mqttHost,
      port: mqttPort,
      username: mqttUser,
      password: mqttPass,
      clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('connect', () => {
      info('MQTT - Connected');

      this.mqttClient.subscribe('device/+/update', (err) => {
        if (err) {
          error('MQTT - Error subscribing to device/+/update');
        } else {
          info('MQTT - Subscribed device/+/update');
        }
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      if (topic.includes('device') && topic.includes('update')) {
        await this.handleDeviceUpdate(JSON.parse(message.toString()));
      }
    });

    this.mqttClient.on('error', (err) => {
      error(`MQTT - Error in connecting to CloudMQTT: ${err}`);
    });
  }

  private async handleDeviceUpdate(data: DeviceEntity) {
    try {
      info(`MQTT - Device update sensor: ${JSON.stringify(data)}`);
      await this.deviceService.mqttUpdate(data.id, data);
    } catch (err) {
      error(`MQTT - Error in handleDeviceUpdate:
      ${err}`);
    }
  }

  public publicMessage(topic: string, message: any) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    if (!this.mqttClient.connected) {
      error('MQTT - Client not connected');
      return;
    }

    this.mqttClient.publish(topic, message);
  }
}
