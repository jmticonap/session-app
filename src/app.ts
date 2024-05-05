import 'reflect-metadata';
import middy from '@middy/core';
import httpRouterHandler from '@middy/http-router';
import routes from './routes';

export const lambdaHandler = middy().handler(httpRouterHandler(routes));
