import { APIGatewayProxyResult } from 'aws-lambda';
import BaseUseCase from '../../../../applicacion/use-case/base.use-case';
import { inject, singleton } from 'tsyringe';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import { HTTP_STATUS } from '../../../../constants';
import MysqlUserService from '../../infrastructure/service/mysql-user.service';
import UserService from '../../domain/service/user.service';

const className = 'UserCrudUseCase';

@singleton()
export default class UserListUseCase implements BaseUseCase {
    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(MysqlUserService) private _userRepository: UserService,
    ) {}

    async execute(): Promise<APIGatewayProxyResult> {
        const method = this.execute.name;
        try {
            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.findAll()),
            };
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            return {
                statusCode: HTTP_STATUS['NOT_FOUND'],
                body: JSON.stringify({ message: 'No data to show' }),
            };
        }
    }
}
