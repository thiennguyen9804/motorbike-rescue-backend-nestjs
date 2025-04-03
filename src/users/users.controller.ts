import { Controller, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Crud, CrudController } from '@dataui/crud';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { UsersCrudService } from './users-crud.service';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Crud({
  model: {
    type: UserEntity,
  },
  dto: {
    create: CreateUserDto,
    update: UpdateUserDto,
  },
  query: {
    exclude: ['password'],
    softDelete: true,
    alwaysPaginate: true,
    maxLimit: 100,
    limit: 10,
    join: {
      role: { eager: true },
      status: { eager: true },
    },
    cache: 0,
  },
})
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController implements CrudController<UserEntity> {
  constructor(public service: UsersCrudService) {}
}
