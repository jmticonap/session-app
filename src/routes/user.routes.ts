import { container } from 'tsyringe';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Route } from '@middy/http-router';
import UserController from '../modules/user/application/controller/user.controller';

const userController = container.resolve(UserController);

export const userRoutes: Route<APIGatewayProxyEvent>[] = [
    {
        method: 'GET',
        path: '/user',
        handler: userController.findAll,
    },
    {
        method: 'GET',
        path: '/user/{id}',
        handler: userController.findById,
    },
    {
        method: 'POST',
        path: '/user',
        handler: userController.newUser,
    },
];
