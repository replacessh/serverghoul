import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from './Review';
import { CartItem } from './CartItem';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  category: string;

  @Column()
  imageUrl: string;

  @Column('int')
  stock: number;

  @Column('text', { array: true, nullable: true })
  sizes: string[];

  @OneToMany(() => Review, review => review.product, { cascade: true })
  reviews: Review[];

  @OneToMany(() => CartItem, cartItem => cartItem.product, { cascade: true })
  cartItems: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 