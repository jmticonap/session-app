import { RowDataPacket } from 'mysql2/promise';
import BaseEntity from '../domain/entity/base.entity';

export default interface CrudOperations<E extends BaseEntity, P extends E & RowDataPacket> {
    findAll(): Promise<E[]>;

    findById(id: number): Promise<E>;

    insert(entity: E): Promise<E>;

    update(entity: E): Promise<E>;
}
