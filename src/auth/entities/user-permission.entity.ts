import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

/**
 * Ajuste de permissão de um usuário em relação às permissões do seu papel:
 * `granted = true` concede uma permissão que o papel não tem e
 * `granted = false` revoga uma que o papel tem.
 */
@Entity('user_permissions')
@Unique('uk_user_permissions_user_permission', ['userId', 'permissionId'])
export class UserPermission {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_user_permissions',
  })
  id!: number;

  @Column({ type: 'integer', name: 'user_id' })
  userId!: number;

  @Column({ type: 'integer', name: 'permission_id' })
  permissionId!: number;

  @Column({ type: 'boolean' })
  granted!: boolean;

  @ManyToOne(() => User, (user) => user.permissoesPersonalizadas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_user_permissions_user',
  })
  user!: User;

  @ManyToOne(() => Permission, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName: 'fk_user_permissions_permission',
  })
  permission!: Permission;
}
