import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshSession } from './refresh-session.entity';
import { Role } from './role.entity';

@Entity('users')
@Check('ck_users_login_letters_only', `"login" ~ '^[A-Za-z]+$'`)
@Check('ck_users_login_min_length', `char_length(trim("login")) >= 3`)
@Index('idx_users_is_active_login', ['isActive', 'login'])
export class User {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_users',
  })
  id!: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  login!: string;

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
