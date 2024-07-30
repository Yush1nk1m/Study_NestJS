# Section 10. 설정 및 마무리

## 설정(Configuration)이란?

소스 코드 안에서 어떤 부분은 환경에 따라 코드를 다르게 넣어줘야 할 때가 있으며, 은닉해야 하는 경우도 있다. 이러한 코드들을 위한 설정 파일을 따로 만들어 보관하는 방법에 대해 알아보자.

설정 파일은 런타임에 변경되지 않고 애플리케이션 시작 시 로드되어 그 값들을 정의해 준다. XML, JSON, YAML, 환경 변수 등 많은 형식을 사용할 수 있다.

### Codebase vs. Environment variables

XML, JSON, YAML 등과 같은 것을 Codebase라고 부르며 그 외의 방법은 환경 변수이다. 일반적으로 포트 번호와 같이 남들에게 노출되어도 상관없는 정보들은 Codebase에, 은닉해야 하는 정보는 환경 변수에 담는다.

### 설정을 위해 필요한 모듈

설정을 위해 `config`라는 모듈을 설치해야 한다.

```
$ npm i config --save
```

### Config 모듈을 이용한 설정 파일 생성

**config/default.yml**
```
server:
  port: 3000

db:
  type: 'postgres'
  port: 5432
  database: 'board-app'

jwt:
  expiresIn: 3600
```

**config/development.yml**
```
db:
  host: 'localhost'
  username: 'postgres'
  synchronize: true

jwt:
  secret: 'secret'
```

**config/production.yml**
```
db:
  synchronize: false
```

### 설정 파일에 저장된 내용을 사용하기

어떤 파일에서든 `config` 모듈을 import 하여 사용할 수 있다.

**src/main.ts**
```
...
  const { port } = config.get('server');
  await app.listen(port);
...
```

## 설정과 환경 변수 코드에 적용하기

설정 파일에 넣은 값을 코드에 적용해 주고, 환경 변수도 정의하여 사용해 보자.

**src/configs/typeorm.config.ts**
```
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');

export const typeORMConfig: TypeOrmModuleOptions = {
  // Database type
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.POSTGRES_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  // entities should be loaded for this connection
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  // be careful to use and do not use in production environment
  synchronize: dbConfig.synchronize,
};
```

**src/auth/auth.module.ts**
```
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import * as config from 'config';

const jwtConfig = config.get('jwt');
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

**src/auth/jwt.strategy.ts**
```
...
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
...
```

