import MysqlCrudOperations from '../../../../db/mysql/mysql-crud-operations';
import UserEntity, { UserEntityPacket } from '../entity/user.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface UserService extends MysqlCrudOperations<UserEntity, UserEntityPacket> {}
