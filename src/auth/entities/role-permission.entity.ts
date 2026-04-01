import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_role_permissions',
  })
  id!: number;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { nullable: false })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_role_permissions_role',
  })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    nullable: false,
  })
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName: 'fk_role_permissions_permission',
  })
  permission!: Permission;
}
