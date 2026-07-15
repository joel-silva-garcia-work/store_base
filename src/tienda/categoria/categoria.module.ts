import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { Traza } from '../../security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Traza])
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService]
})
export class CategoriaModule {}
