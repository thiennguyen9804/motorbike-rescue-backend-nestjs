import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { DeviceEntity } from '../devices/infrastructure/persistence/relational/entities/device.entity';
import dayjs from 'dayjs';
import { info } from 'console';
import { SocketIoGateway } from '../socket-io/socket-io.gateway';
import { DeviceStatus, DeviceStatusStr } from '../devices/domain/device-status.enum';

@Injectable()
export class CheckDeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly socketIoGateway: SocketIoGateway,
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEvery5Minutes() {
    info('Check device task');

    const fiveMinutesAgo = dayjs().subtract(5, 'minutes').toDate();

    const offlineDevices = await this.deviceRepository.find({
      where: {
        updatedAt: LessThan(fiveMinutesAgo),
        status: DeviceStatusStr.ONLINE,
      },
      join: { alias: 'device', leftJoinAndSelect: { user: 'device.user' } },
    });

    if (offlineDevices.length > 0) {
      await this.deviceRepository.update(
        { id: In(offlineDevices.map((device) => device.id)) },
        { status: DeviceStatusStr.OFFLINE },
      );

      for (const device of offlineDevices) {
        this.socketIoGateway.emitToClients(`device:${device.id}`, {
          ...device,
          status: DeviceStatus.OFFLINE,
        });
      }
    }
  }
}
