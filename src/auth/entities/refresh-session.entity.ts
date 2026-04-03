import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_sessions')
@Index('idx_refresh_sessions_user_id', ['userId'])
@Index('idx_refresh_sessions_validacao', ['userId', 'revokedAt', 'expiresAt'])
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_refresh_sessions',
  })
  id!: string;

  @Column({
    type: 'integer',
    name: 'user_id',
  })
  userId!: number;

  @ManyToOne(() => User, (user) => user.refreshSessions, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_refresh_sessions_user',
  })
  user!: User;

  @Column({
    type: 'varchar',
    name: 'token_hash',
    length: 255,
  })
  tokenHash!: string;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt!: Date;

  @Column({
    type: 'timestamp',
    name: 'revoked_at',
    nullable: true,
  })
  revokedAt?: Date;

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
