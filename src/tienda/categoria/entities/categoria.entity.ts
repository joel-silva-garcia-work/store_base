import { Entity, Column, Check } from 'typeorm';
import { BasicInformationEntity } from './../../../common/base/entities';


@Entity({ name: 'categoria', schema: 'tienda' })
export class Categoria extends BasicInformationEntity {
  @Column({ unique: true })
  icon: string;

  toTace(): Record<string, string> {
    const trace: Record<string, string> = {};
    Object.entries(this).forEach(([key, value]) => {
      trace[key] = value === null || value === undefined ? '' : String(value);
    });
    return trace;
  }
}
