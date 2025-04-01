import {
    Injectable,
    CanActivate,
    ExecutionContext,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class DeviceOwnershipGuard implements CanActivate {
    constructor(private readonly devicesService: DevicesService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const deviceId = request.params.id;

        if (!user || !deviceId) {
            throw new ForbiddenException('Invalid request');
        }

        const userId: number = user.id;
        const userRoleId: number = user.role.id;

        const device = await this.devicesService.findOne({
            where: { id: Number(deviceId)},
            join: {
                alias: 'device',
                leftJoinAndSelect: {
                    user: 'device.user',
                },
            },
        });

        if (!device) {
            throw new NotFoundException('Device not found');
        }

        if (userRoleId !== RoleEnum.admin && device.user_id !== userId) {
            throw new ForbiddenException(
                'Permission denied: You can only access your own devices',
            );
        }

        request.device = device;

        return true;
    }
}
