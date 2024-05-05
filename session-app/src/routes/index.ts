import { Route } from '@middy/http-router';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../presentation/handler';
import { userRoutes } from './user.routes';

const routes: Route<APIGatewayProxyEvent>[] = [
    {
        method: 'GET',
        path: '/hello',
        handler,
    },
    ...userRoutes,
];

export default routes;
