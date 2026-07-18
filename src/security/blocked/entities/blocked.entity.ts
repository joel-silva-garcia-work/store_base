import { Entity, Column, Check } from 'typeorm';
import { BasicInformationEntity } from './../../../common/base/entities';
import { AccessTypeEnum } from 'src/common/enum/access.type.enum';


@Entity({ name: 'blocked', schema: 'security' })
export class Blocked extends BasicInformationEntity {

  @Column()
  identifier:string;

  @Column()
  accessType: AccessTypeEnum;

  toTace(): Record<string, string> {
    const trace: Record<string, string> = {};
    Object.entries(this).forEach(([key, value]) => {
      trace[key] = value === null || value === undefined ? '' : String(value);
    });
    return trace;
  }
}
