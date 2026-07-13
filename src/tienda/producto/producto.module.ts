import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { Traza } from '../../security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Traza])
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService]
})
export class ProductoModule {}
