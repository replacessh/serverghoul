import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Review } from './Review';
import { SupportTicket } from './SupportTicket';
import { CartItem } from './CartItem';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  banReason: string;

  @Column({ type: 'timestamp', nullable: true })
  bannedAt: Date | null;

  @Column('text', { array: true, default: [] })
  favoriteProductIds: string[];

  @OneToMany(() => Review, review => review.author)
  reviews: Review[];

  @OneToMany(() => SupportTicket, ticket => ticket.user)
  supportTickets: SupportTicket[];

  @OneToMany(() => CartItem, cartItem => cartItem.user)
  cartItems: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
} 