import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blocked } from './entities/blocked.entity';
import { CreateBlockedDto, UpdateBlockedDto } from './dto';
import { Traza } from '../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';
import { IdDto } from 'src/common/base/dto/id.dto';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';


@Injectable()
export class BlockedService extends BaseServiceCRUD<
Blocked,
CreateBlockedDto,
UpdateBlockedDto> {
  constructor(
    @InjectRepository(Blocked)
    private readonly repository: Repository<Blocked>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {
    super(repository)
  }

  toTace(entity: Blocked): Record<string, string> {
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

  async Add(createDto: CreateBlockedDto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Blocked;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: UpdateBlockedDto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Blocked;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Blocked;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Delete(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.remove(dto);
    if (result.isSuccess && result.data) {
      const savedEntity = result.data as Blocked;
      traza.traza = this.toTace(savedEntity);
      await this.trazaRepository.save(traza);
    }
    return result;
  }

}