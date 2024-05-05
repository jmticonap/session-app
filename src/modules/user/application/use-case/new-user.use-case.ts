import { inject, singleton } from 'tsyringe';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import BaseUseCase from '../../../../applicacion/use-case/base.use-case';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import MysqlUserService from '../../infrastructure/service/mysql-user.service';
import UserService from '../../domain/service/user.service';
import UserEntity from '../../domain/entity/user.entity';
import { BadRequestError, SchemaValidationError } from '../../../../errors';
import { UserRequestDtoSchema } from '../../domain/dto/user-request.dto';
import { HTTP_STATUS } from '../../../../constants';

const className = 'UserCrudUseCase';

@singleton()
export default class NewUserUseCase implements BaseUseCase {
    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(MysqlUserService) private _userRepository: UserService,
    ) {}

    async execute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const method = this.execute.name;
        try {
            if (!event.body) throw new BadRequestError();
            const user = <UserEntity>JSON.parse(event.body);

            const isvalid = UserRequestDtoSchema.safeParse(user);
            if (!isvalid.success) {
                throw new SchemaValidationError(JSON.stringify(isvalid.error.errors));
            }

            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.insert(user)),
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
