import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { array: true })
  summaries: Array<string>;
}
