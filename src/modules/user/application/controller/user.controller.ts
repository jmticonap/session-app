import { inject, singleton } from 'tsyringe';
import PowerToolsLogger from '../../../../infrastructure/logger/power-tools.logger';
import Logger from '../../../../infrastructure/logger/logger';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import { HTTP_STATUS } from '../../../../constants';
import MysqlUserRepository from '../../infrastructure/repository/mysql-user.repository';
import UserRepository from '../../domain/repository/user.repository';
import { BadRequestError, SchemaValidationError } from '../../../../errors';
import { UserRequestDtoSchema } from '../../domain/dto/user-request.dto';
import UserEntity from '../../domain/entity/user.entity';

const className = 'UserController';

@singleton()
export default class UserController {
    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(MysqlUserRepository) private _userRepository: UserRepository,
    ) {}

    public findAll = middy<APIGatewayProxyEvent, APIGatewayProxyResult>().handler(async () => {
        try {
            return {
                statusCode: HTTP_STATUS['OK'],
                body: JSON.stringify(await this._userRepository.findAll()),
            };
        } catch (error) {
            this._logger.error(className, 'findAll', undefined, {}, '', <Error>error);
            if (error instanceof BadRequestError || error instanceof SchemaValidationError) {
                return {
                    statusCode: error.statusCode,
                    body: error.message,
                };
            }
            return {
                statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                body: JSON.stringify(error),
            };
        }
    });

    public findById = middy<APIGatewayProxyEvent, APIGatewayProxyResult>().handler(
        async (event: APIGatewayProxyEvent) => {
            const method = 'findById';
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
        },
    );

    public newUser = middy<APIGatewayProxyEvent, APIGatewayProxyResult>().handler(
        async (event: APIGatewayProxyEvent) => {
            const method = 'newUser';
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
        },
    );
}
