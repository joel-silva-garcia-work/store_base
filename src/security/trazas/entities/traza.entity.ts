// src/traza/traza.entity.ts

import { BasicEntity } from 'src/common/base/entities';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'traza', schema: 'security' })
export class Traza extends BasicEntity { 

  @Column()
  ip: string;

  @Column()
  url: string;

  @Column({nullable: true})
  user: string;

  @Column({ type: 'jsonb', nullable: true })
  traza: Record<string, any>; // Campo JSON para almacenar los datos de seguimiento

}
