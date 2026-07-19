import { Entity, Column, Check } from 'typeorm';
import { BasicInformationEntity } from './../../../common/base/entities';

@Entity({ name: 'producto', schema: 'tienda' })
export class Producto extends BasicInformationEntity {

  @Column()
  photo: string;

  @Column({
    type: 'int'
  })
  idproducto: number;

  @Column()
  codigo: string;

  @Column({ type: 'jsonb' })
  caracteristicas: Record<string, any>;

  toTace(): Record<string, string> {
    const trace: Record<string, string> = {};
    Object.entries(this).forEach(([key, value]) => {
      trace[key] = value === null || value === undefined ? '' : String(value);
    });
    return trace;
  }
}
