import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto, UpdateProductoDto } from './dto';
import { Traza } from '../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { IdDto } from 'src/common/base/dto/id.dto';


@Injectable()
export class ProductoService extends BaseServiceCRUD<
Producto,
CreateProductoDto,
UpdateProductoDto> {
  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {
    super(repository)
  }

  toTace(entity: Producto): Record<string, string> {
    return entity.toTace();
  }

   async findAllItems() {
    return await super.findAllItems();
  }


   async findActiveItems() {
    return await super.findActiveItems();
  }

   async findOne(id: IdDto) {
    return await super.findOne(id);
  }

  async Add(createDto: CreateProductoDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Producto;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateProductoDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Producto;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Producto;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Delete(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.remove(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Producto;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

}