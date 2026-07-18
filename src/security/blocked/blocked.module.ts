import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blocked } from './entities/blocked.entity';
import { BlockedService } from './blocked.service';
import { BlockedController } from './blocked.controller';
import { Traza } from '../../security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blocked, Traza])
  ],
  controllers: [BlockedController],
  providers: [BlockedService],
  exports: [BlockedService]
})
export class BlockedModule {}
