import {
  // common
  Module,
} from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { RelationalUserPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersCrudService } from './users-crud.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    infrastructurePersistenceModule,
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersCrudService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
