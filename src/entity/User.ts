import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({
    
})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        length: 128,
        collation: 'utf8mb4_unicode_ci'
    })
    username: string

    @Column({
        type: 'varchar',
        length: 128,
        collation: 'utf8mb4_unicode_ci'
    })
    password: string

    @Column({
        type: 'varchar',
        length: 128,
        collation: 'utf8mb4_unicode_ci'
    })
    email: string

    @Column({
        default: false,
        collation: 'utf8mb4_unicode_ci'
    })
    emailVerified: boolean

    @Column({
        type: 'varchar',
        length: 16,
        collation: 'utf8mb4_unicode_ci'
    })
    mobilePhone: string

    @Column({
        type: 'varchar',
        length: 256,
        collation: 'utf8mb4_unicode_ci'
    })
    jwt: string

    @Column({
        type: 'varchar',
        length: 32,
        collation: 'utf8mb4_unicode_ci'
    })
    createTime: string

    @Column({
        type: 'varchar',
        length: 32,
        collation: 'utf8mb4_unicode_ci'
    })
    lastLoginTime: string
    
    @Column({
        type: 'varchar',
        length: 16,
        collation: 'utf8mb4_unicode_ci'
    })
    state: string
}