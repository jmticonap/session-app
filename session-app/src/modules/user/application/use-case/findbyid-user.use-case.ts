import { inject, singleton } from 'tsyringe';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import BaseUseCase from '../../../../applicacion/use-case/base.use-case';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import MysqlUserService from '../../infrastructure/service/mysql-user.service';
import UserService from '../../domain/service/user.service';
import { BadRequestError, SchemaValidationError } from '../../../../errors';
import { HTTP_STATUS } from '../../../../constants';

const className = 'FindByIdUserUseCase';

@singleton()
export default class FindByIdUserUseCase implements BaseUseCase {
    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(MysqlUserService) private _userRepository: UserService,
    ) {}

    async execute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const method = this.execute.name;
        try {
            if (!event.pathParameters || !event.pathParameters['id']) throw new BadRequestError();
            const [id] = event.pathParameters['id'];

            this._logger.info(className, method, undefined, { id }, 'QueryStringParams:');

            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.findById(+id)),
            };
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return {
                    statusCode: error.statusCode,
                    body: error.message,
                };
            }

            return {
                statusCode: HTTP_STATUS['NOT_FOUND'],
                body: JSON.stringify(error),
            };
        }
    }
}
