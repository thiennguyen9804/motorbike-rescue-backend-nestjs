import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class DeviceSeedService {
  constructor(
    @InjectRepository(DeviceEntity)
    private repository: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const users = await this.userRepository.find({});
    const userIds = users.map((user) => user.id);
    await this.repository.delete({});

    const devices = Array.from({ length: 30 }, () => {
      return this.repository.create({
        name: faker.vehicle.vehicle(),
        userId: userIds[Math.floor(Math.random() * userIds.length)],
      });
    });

    await this.repository.save(devices);
  }
}
