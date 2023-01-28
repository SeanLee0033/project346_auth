import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column({ default: false })
  public isEmailConfirmed: boolean;
  // 핸드폰, 기타등등 추가.
}
