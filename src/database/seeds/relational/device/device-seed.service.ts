import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { DeviceRole } from '../../../../devices/domain/device-role.enum';

@Injectable()
export class DeviceSeedService {
  constructor(
    @InjectRepository(DeviceEntity)
    private repository: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async run() {
    await this.repository.delete({});

    const adminMqttUser = await this.configService.getOrThrow('app.mqttUser', {
      infer: true,
    });
    const adminMqttPassword = await this.configService.getOrThrow(
      'app.mqttPass',
      { infer: true },
    );

    await this.repository
      .create({
        name: 'Admin',
        userId: 1,
        deviceKey: adminMqttUser,
        deviceToken: adminMqttPassword,
        role: DeviceRole.ADMIN,
      })
      .save();

    const users = await this.userRepository.find({});
    const userIds = users.map((user) => user.id);

    const devices = Array.from({ length: 30 }, () => {
      return this.repository.create({
        name: faker.vehicle.vehicle(),
        userId: userIds[Math.floor(Math.random() * userIds.length)],
      });
    });

    await this.repository.save(devices);
  }
}
