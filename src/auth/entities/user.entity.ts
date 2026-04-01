import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshSession } from './refresh-session.entity';
import { Role } from './role.entity';

@Entity('users')
@Check('ck_users_email_not_blank', `char_length(trim("email")) > 0`)
export class User {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_users',
  })
  id!: number;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    name: 'password_hash',
    length: 255,
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: 'integer',
    name: 'role_id',
  })
  roleId!: number;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_users_role',
  })
  role!: Role;

  @OneToMany(() => RefreshSession, (refreshSession) => refreshSession.user)
  refreshSessions!: RefreshSession[];

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;
}
