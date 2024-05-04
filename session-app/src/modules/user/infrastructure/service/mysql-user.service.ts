import { Lifecycle, inject, scoped } from 'tsyringe';
import MysqlCrudOperations from '../../../../db/mysql/mysql-crud-operations';
import UserEntity, { UserEntityPacket } from '../../domain/entity/user.entity';
import UserService from '../../domain/service/user.service';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import MysqlExecutor from '../../../../db/mysql/mysql-executor';

const className = 'MysqlUserService';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlUserService extends MysqlCrudOperations<UserEntity, UserEntityPacket> implements UserService {
    constructor(@inject(PowerToolsLogger) logger: Logger, @inject(MysqlExecutor) executor: MysqlExecutor) {
        super(className, logger, executor, 'user');
    }
}
