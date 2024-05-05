import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Route } from '@middy/http-router';
import { container } from 'tsyringe';
import { HTTP_STATUS } from '../constants';
import NewUserUseCase from '../modules/user/application/use-case/new-user.use-case';
import UserListUseCase from '../modules/user/application/use-case/user-list.use-case';
import FindByIdUserUseCase from '../modules/user/application/use-case/findbyid-user.use-case';

export const userRoutes: Route<APIGatewayProxyEvent>[] = [
    {
        method: 'GET',
        path: '/user',
        handler: middy().handler(() => {
            try {
                const userListUseCase = container.resolve(UserListUseCase);
                return userListUseCase.execute();
            } catch (error) {
                return {
                    statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                    body: JSON.stringify(error),
                };
            }
        }),
    },
    {
        method: 'GET',
        path: '/user/{id}',
        handler: middy<APIGatewayProxyEvent, APIGatewayProxyResult>().handler((event) => {
            try {
                const userListUseCase = container.resolve(FindByIdUserUseCase);
                return userListUseCase.execute(event);
            } catch (error) {
                return {
                    statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                    body: JSON.stringify(error),
                };
            }
        }),
    },
    {
        method: 'POST',
        path: '/user',
        handler: middy<APIGatewayProxyEvent, APIGatewayProxyResult>().handler((event) => {
            try {
                const newUserUseCase = container.resolve(NewUserUseCase);
                return newUserUseCase.execute(event);
            } catch (error) {
                return {
                    statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                    body: JSON.stringify(error),
                };
            }
        }),
    },
];
