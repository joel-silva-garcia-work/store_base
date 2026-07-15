import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto';
import { Traza } from '../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';


@Injectable()
export class CategoriaService extends BaseServiceCRUD<
Categoria,
CreateCategoriaDto,
UpdateCategoriaDto> {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {
    super(repository)
  }

  toTace(entity: Categoria): Record<string, string> {
    return entity.toTace();
  }

  async findAllItems() {
    return await super.findAllItems();
  }


  async findActiveItems() {
    return await super.findActiveItems();
  }

  override async findOne(id: IdDto) {
    return await super.findOne(id);
  }

  async Add(createDto: CreateCategoriaDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Categoria;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateCategoriaDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Categoria;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Categoria;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Delete(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.remove(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Categoria;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

}