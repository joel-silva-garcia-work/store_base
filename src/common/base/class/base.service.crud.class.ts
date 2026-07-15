import { CodeEnum } from 'src/common/enum/code.enum';
import { CrudDto, ReturnDto } from '../dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { KindEnum } from 'src/common/enum/kind.enum';
import { ClassValidator } from '../validator/class.validator';
import { ValidateScenarioDto } from '../dto/validate.scenario.dto';
import { BaseDto } from '../dto/base.crud.dto';
import { IdDto } from '../dto/id.dto';
import { MethodEnum } from 'src/common/enum/method.enum';
import { ResourceEnum } from 'src/common/enum/resource.enum';
import { returnClass } from './returned.class';
import { MessageCodes } from 'src/common/enum/messageCodes.enum';

// Interfaz completa del SearchingDto

export class BaseServiceCRUD<
  TEntity,
  createDto extends BaseDto,
  updateDto extends BaseDto,
>  extends returnClass{
  private dto: CrudDto;
  private returnDto: ReturnDto;
  private valid: boolean;
  private queryBuilder: SelectQueryBuilder<TEntity>;

  constructor(repo: Repository<TEntity>) {
    super();
    this.dto = new CrudDto();
    this.dto.repo = repo;
  }

  async findAllItems(): Promise<ReturnDto> {
    const data = await this.dto.repo.find({});
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
  }
  async findActiveItems(): Promise<ReturnDto> {
    const data = await this.dto.repo.find({
      where: { isActive: true },
    });
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
  }

  async create(createDto: createDto): Promise<ReturnDto> {
    if (createDto.rules) {
      this.valid = await this._validate(createDto);
    } else {
      this.valid = true;
    }
    if (this.valid) {
      try {
        const data = await this.dto.repo.save(createDto);
        return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
      } catch (error) {
        return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, MessageCodes.ERROR.toString(), MessageCodes.ERROR, CodeEnum.BAD_REQUEST);

      }
    } else {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST,ResourceEnum.ALREADY_EXST, MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
    }
  }
  async update(updateDto: updateDto): Promise<ReturnDto> {
    this.dto.id = updateDto.id;
    if (updateDto.rules) {
      this.valid = await this._validate(updateDto);
    } else {
      this.valid = true;
    }
    if (this.valid) {
      try {
        const object = await this.dto.repo.findOne({
          where: {
            id: this.dto.id,
          },
        });
        if (!object) {
          return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, 'the Item with id ${this.dto.id} do not exist', MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
        } else {
          const data = await this.dto.repo.save(updateDto);
          return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
        }
      } catch (error) {
        return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, ResourceEnum.Exception, MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
      }
    } else {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, ResourceEnum.ALREADY_EXST, MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
    }
  }

  async remove(IdDto: IdDto): Promise<ReturnDto> {
    this.dto.id = IdDto.id;
    const item = await this.dto.repo.findOne({
      where: {
        id: this.dto.id,
      },
    });
    if (!item) {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, 'the Item with id ${this.dto.id} do not exist', MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
    } 
    else {
      const data = await this.dto.repo.softDelete(this.dto.id);
      return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
    }
  }

  async findOne(dto: IdDto):Promise<ReturnDto> {
    const item = await this.dto.repo.findOne({
      where: {
        id: dto.id,
      },
    });
    if (!item) {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, 'the Item with id ${this.dto.id} do not exist', MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
    } else {
      const data = [item];
      return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
    }
  }
  async findOneActive(dto: IdDto):Promise<ReturnDto> {
    const item = await this.dto.repo.findOne({
      where: {
        id: dto.id,
        isActive: true
      },
    });
    if (!item) {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, 'the Item with id ${this.dto.id} do not exist', MessageCodes.ERROR, CodeEnum.BAD_REQUEST);
    } else {
      const data = [item];
      return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
    }
  }

  async _validate(dto: BaseDto): Promise<boolean> {
    const rules = dto.rules;
    this.valid = true;
    if (rules.comparisonKind == KindEnum.UINQUE) {
      const scenarios = [];
      rules.field.forEach((rule: string) => {
        const scenario = new ValidateScenarioDto();
        scenario.table = this.dto.repo.metadata.tableName;
        scenario.field = rule;
        scenario.value = dto[rule];
        scenarios.push(scenario);
      });
      const validated: ClassValidator = new ClassValidator();
      if (rules.method == MethodEnum.CREATE) {
        this.valid = await validated.validateCreate(this.dto.repo, scenarios);
      } else if (rules.method == MethodEnum.UPDATE) {
        this.valid = await validated.validateUpdate(
          dto.id,
          this.dto.repo,
          scenarios,
        );
      }
    }
    return this.valid;
  }
  async active(dto: IdDto): Promise<ReturnDto> {
    this.dto.id = dto.id;
    const item = await this.dto.repo.findOne({      
      where: {
        id: this.dto.id,
      },
    });
    if (item && item.id == this.dto.id) 
     {
      item.isActive = !item.isActive;
      const data = await this.dto.repo.save(item);
      return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
    }
    else {
      return this.getReturn(false, CodeEnum.BAD_REQUEST, null, CodeEnum.BAD_REQUEST, 'the Item with id ${this.dto.id} do not exist', MessageCodes.NOT_FOUND, CodeEnum.BAD_REQUEST);
    }
  }
}
