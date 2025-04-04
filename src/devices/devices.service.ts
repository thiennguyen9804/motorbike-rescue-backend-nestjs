import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { MqttService } from '../mqtt/mqtt.service';
import { SocketIoGateway } from '../socket-io/socket-io.gateway';
import { info } from 'ps-logger';
import { CrudRequest } from '@dataui/crud';
import { DeviceStatus, DeviceStatusStr } from './domain/device-status.enum';
import {
  UpdateDevicePinDto,
  UpdateDeviceSensorDto,
} from './dto/update-device.dto';
import { DeviceRole } from './domain/device-role.enum';
import { ScanDevicesDto } from './dto/scan-devices.dto';

@Injectable()
export class DevicesService extends TypeOrmCrudService<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity) repo: Repository<DeviceEntity>,
    @Inject(forwardRef(() => MqttService))
    private mqttService: MqttService,
    @Inject(forwardRef(() => SocketIoGateway))
    private socketIoGateway: SocketIoGateway,
  ) {
    super(repo);
  }

  async scanNearbyDevices({
    latitude,
    longitude,
    radius,
    page = 1,
    limit = 10,
    status,
  }: ScanDevicesDto) {
    // Convert radius from meters to degrees (approximate)
    // 1 degree is approximately 111,320 meters at the equator
    const radiusInDegrees = radius / 111320;

    // Create a point from the given coordinates
    const point = `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`;

    // Get total count of devices within radius
    const total = await this.repo
      .createQueryBuilder('device')
      .where(`ST_DWithin(device.position, ${point}, :radius)`, {
        radius: radiusInDegrees,
      })
      .andWhere('role = :role', { role: DeviceRole.DEVICE })
      .andWhere('device.status = :status', { status: status ? DeviceStatus[status] : DeviceStatus.ONLINE })
      .getCount();

    // Find devices within the radius with pagination
    const devices = await this.repo
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.user', 'user')
      .where(`ST_DWithin(device.position, ${point}, :radius)`, {
        radius: radiusInDegrees,
      })
      .andWhere('role = :role', { role: DeviceRole.DEVICE })
      .andWhere('device.status = :status', { status: status ? DeviceStatus[status] : DeviceStatus.ONLINE })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: devices,
      count: devices.length,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async socketUpdate(id: number, payload: UpdateDevicePinDto) {
    const queryRunner: QueryRunner =
      this.repo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const device = await queryRunner.manager.findOne(DeviceEntity, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!device) {
        throw new Error('Device not found');
      }

      if (true) {
        info(`Device updated: ${JSON.stringify(payload)}`);

        await queryRunner.manager.update(DeviceEntity, id, payload);

        this.mqttService.publicMessage(`device/${id}`, {});

        const newDevice = await queryRunner.manager.findOne(DeviceEntity, {
          where: { id },
          join: {
            alias: 'device',
            leftJoinAndSelect: {
              user: 'device.user',
            },
          },
        });

        this.socketIoGateway.emitToRoom(
          `device/${id}`,
          'device_data',
          newDevice,
        );

        await queryRunner.commitTransaction();

        return payload;
      }

      await queryRunner.commitTransaction();
      return false;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err; // Ném lỗi để xử lý ở tầng trên
    } finally {
      await queryRunner.release();
    }
  }

  async mqttUpdate(id: number, device: UpdateDeviceSensorDto) {
    const queryRunner: QueryRunner =
      this.repo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(DeviceEntity, id, {
        ...device,
        status: DeviceStatusStr.ONLINE,
        lastUpdate: new Date(),
      });

      const newDevice = await queryRunner.manager.findOne(DeviceEntity, {
        where: { id },
        join: {
          alias: 'device',
          leftJoinAndSelect: {
            user: 'device.user',
          },
        },
      });

      await queryRunner.commitTransaction();

      info(`Device updated: ${JSON.stringify(newDevice)}`);

      this.socketIoGateway.emitToRoom(`device/${id}`, 'device_data', newDevice);

      return newDevice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDevice(req: CrudRequest, dto: UpdateDevicePinDto) {
    const newDevice = await this.updateOne(req, dto);

    this.socketIoGateway.emitToRoom(
      `device/${newDevice.id}`,
      'device_data',
      newDevice,
    );

    this.mqttService.publicMessage(`device/${newDevice.id}`, {});

    return newDevice;
  }
}
