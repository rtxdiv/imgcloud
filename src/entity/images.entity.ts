import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('images')
export class Images {

    @PrimaryGeneratedColumn()
    id: number

    @Column('char', { length: 16 })
    img_id: string

    @Column('char', { length: 5 })
    ext: string

    @Column('char', { length: 10 })
    path: string

    @Column('char', { length: 36 })
    user_id: string
}