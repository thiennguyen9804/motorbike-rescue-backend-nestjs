import { Injectable } from '@nestjs/common';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DevicesService extends TypeOrmCrudService<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity) repo: Repository<DeviceEntity>,
  ) {
    super(repo);
  }
}
