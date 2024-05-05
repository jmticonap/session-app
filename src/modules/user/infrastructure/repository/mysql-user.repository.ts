import { Lifecycle, inject, scoped } from 'tsyringe';
import UserEntity, { UserEntityPacket } from '../../domain/entity/user.entity';
import UserRepository from '../../domain/repository/user.repository';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import MysqlCrudOperations from '../../../../infrastructure/db/mysql/mysql-crud-operations';
import MysqlExecutor from '../../../../infrastructure/db/mysql/mysql-executor';

const className = 'MysqlUserService';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlUserRepository
    extends MysqlCrudOperations<UserEntity, UserEntityPacket>
    implements UserRepository
{
    constructor(@inject(PowerToolsLogger) logger: Logger, @inject(MysqlExecutor) executor: MysqlExecutor) {
        super(className, logger, executor, 'user');
    }
}
