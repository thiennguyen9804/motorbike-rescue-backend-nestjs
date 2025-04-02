import { Controller, ForbiddenException, Get, Request, UseGuards, Query } from '@nestjs/common';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@dataui/crud';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { DevicesService } from './devices.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '../roles/roles.enum';
import { UpdatedeviceDto } from './dto/update-device.dto';
import { AuthGuard } from '@nestjs/passport';
import { SCondition } from '@dataui/crud-request/lib/types/request-query.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceOwnershipGuard } from './device-ownership.guard';
import crypto from 'crypto';
import { DeviceRole } from './domain/device-role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ScanDevicesDto } from './dto/scan-devices.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Crud({
  model: { type: DeviceEntity },
  dto: {
    update: UpdatedeviceDto,
    create: CreateDeviceDto,
  },
  query: {
    alwaysPaginate: true,
    maxLimit: 100,
    limit: 10,
    cache: 0,
    softDelete: true,
    join: {
      user: { eager: true },
    },
    filter: [
      {
        field: 'role',
        operator: 'eq',
        value: '0',
      },
    ],
  },

  routes: {
    exclude: ['replaceOneBase', 'recoverOneBase'],
  },
})
@ApiTags('Devices')
@Controller({ path: 'devices', version: '1' })
export class DevicesController implements CrudController<DeviceEntity> {
  constructor(
    public service: DevicesService,
    @InjectRepository(DeviceEntity) public repo: Repository<DeviceEntity>,
  ) { }

  get base(): CrudController<DeviceEntity> {
    return this;
  }

  @Get('scan')
  async scanDevices(@Query() query: ScanDevicesDto) {
    return this.service.scanNearbyDevices({ ...query, radius: 10000 });
  }

  @Override('getManyBase')
  @Roles(RoleEnum.admin)
  async ovGetManyBase(
    @ParsedRequest() req: CrudRequest,
    @Request() request: any,
  ): Promise<any> {
    const user = request.user;
    const userId: number = user.id;
    const userRoleId: number = user.role.id;
    const adminFilter: SCondition = { role: { $eq: DeviceRole.DEVICE } };
    let andSearch = req.parsed.search.$and;

    if (userRoleId !== RoleEnum.admin) {
      const userIdFilter: SCondition = { userId: { $eq: userId } };

      if (req.parsed.search && '$and' in req.parsed.search) {
        andSearch = [
          ...(req.parsed.search.$and || []),
          userIdFilter,
          adminFilter,
        ];
      } else {
        andSearch = [userIdFilter, adminFilter];
      }
    }

    return await this.service.getMany({
      ...req,
      parsed: {
        ...req.parsed,
        search: {
          $and: andSearch || [],
        },
      },
    });
  }

  @Override('getOneBase')
  @UseGuards(DeviceOwnershipGuard)
  ovGetOneBase(@Request() request: any): Promise<DeviceEntity> {
    return request.device;
  }

  @Override('updateOneBase')
  @UseGuards(DeviceOwnershipGuard)
  async ovUpdateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UpdatedeviceDto,
  ): Promise<DeviceEntity> {
    return await this.service.updateOne(req, {
      ...dto,
      user: dto.userId ? { id: dto.userId } : undefined,
    });
  }

  @Get(':id/password')
  @UseGuards(DeviceOwnershipGuard)
  async getDevicePassword(
    @ParsedRequest() req: CrudRequest,
    @Request() request: any,
  ): Promise<DeviceEntity> {
    const deviceToken = crypto.randomBytes(16).toString('hex');

    await this.repo.update(request.device.id, {
      deviceToken: deviceToken,
    });

    return {
      ...request.device,
      deviceToken: deviceToken,
    };
  }

  @Override('deleteOneBase')
  @UseGuards(DeviceOwnershipGuard)
  async ovDeleteOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<void | DeviceEntity> {
    return await this.service.deleteOne(req);
  }
}
