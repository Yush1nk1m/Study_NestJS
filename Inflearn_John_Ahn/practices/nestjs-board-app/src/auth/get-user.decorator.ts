import { createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx) => {
  const req = ctx.switchToHttp().getHttpRequest();
  return req.user;
});
