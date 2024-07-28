# Section 7. 인증 기능 구현하기

## 인증 기능 구현을 위한 준비

이번 섹션부터는 인증 기능을 구현할 것이다. 다시 한번 만들고자 하는 애플리케이션의 전체적인 구조를 확인하자.

- AppModule(root)
  - BoardModule
    - BoardController
    - BoardEntity
    - BoardService
    - BoardRepository
    - ValidationPipe
  - AuthModule
    - AuthController
    - UserEntity
    - AuthService
    - UserRepository
    - JWT, Passport

즉, 지금부터는 AutoModule을 구현한다.

### CLI를 이용한 Module, Controller, Service 생성

먼저 CLI를 이용해 모듈, 컨트롤러, 서비스를 생성한다.

```
$ nest g module auth
$ nest g controller auth --no-spec
$ nest g service auth --no-spec
```

### 사용자 Entity 생성

다음으로는 사용자에 대한 인증을 해야 하므로 사용자 엔티티를 생성한다.

**src/auth/user.entity.ts**
```
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

### Repository 생성

이 부분은 강의 내용과 달리 TypeORM 0.3 이상 버전 환경을 고려해 `EntityRepository` 대신 `Repository`를 사용할 것이다.

**src/auth/user.repository.ts**
```
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
}
```

### 생성된 Repository를 AuthModule에 등록

생성된 리포지토리를 다른 곳에서 사용할 수 있도록 모듈에 등록하는 과정이 필요하다.

**src/auth/auth.module.ts**
```
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
})
export class AuthModule {}
```

### 생성된 Repository를 AuthService에 Injection

이제 서비스 계층에서 리포지토리를 사용할 수 있도록 의존성을 주입해 주는 과정이 필요하다.

**src/auth/auth.service.ts**
```
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}
}
```

## 회원가입 기능 구현

이번에는 사용자 회원가입 기능을 구현할 것이다. 다시 한번 리포지토리 패턴을 사용한 흐름을 확인해 보자.

![Repository pattern](images/RepositoryPattern.png)

먼저 요청을 유지보수성 있게 받기 위한 DTO를 정의한다.

**src/auth/dto/auth-credential.dto.ts**
```
export class AuthCredentialsDto {
  username: string;
  password: string;
}
```

그 다음 사용자 정보를 생성하기 위한 리포지토리 계층의 로직을 구현한다.

**src/auth/user.repository.ts**
```
...
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const user = this.repository.create({
      username,
      password,
    });

    await this.repository.save(user);
  }
...
```

그 다음 서비스 계층의 로직을 구현한다.

**src/auth/auth.service.ts**
```
...
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.createUser(authCredentialsDto);
  }
...
```

그 다음 컨트롤러 계층에서 구현한 내용들을 연결한다.

**src/auth/auth.controller.ts**
```
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }
}
```

서버를 실행하고 Postman을 사용해 회원가입 기능을 테스트해보자.

## 사용자 데이터 유효성 검사

이번에는 사용자 회원가입 시 이름의 길이, 비밀번호 길이와 같은 조건을 명시하고 유효성 검사를 할 수 있도록 각 컬럼에 조건을 부여한다.

### Class-validator

먼저 `class-validator`를 사용해 DTO에 조건을 명시한다.

**src/auth/dto/auth-credential.dto.ts**
```
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  // only enable english and number
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;
}
```

### ValidationPipe

요청이 컨트롤러로 전달되었을 때 DTO에 명시한 조건을 만족하는지 먼저 검사하려면 컨트롤러에서 `@Body()` 데코레이터에 파이프를 인자로 전달한다.

**src/auth/auth.controller.ts**
```
...
  @Post('signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }
...
```

## 사용자 이름의 고유성 보장

이번에는 사용자 이름이 중복되지 않도록 하는 기능을 구현할 것이다. 이 기능은 두 가지 방식으로 구현이 가능하다.

- 애플리케이션 레벨에서 데이터베이스 조회를 통해 같은 사용자 이름이 존재하는지 검사한다.
- 데이터베이스 레벨에서 같은 사용자 이름을 가진 사용자가 있다면 예외를 발생시킨다.

두 번째 방식으로 구현해 보자. 엔티티 클래스에 `@Unique()` 데코레이터를 사용하여 고유한 값을 가지는 속성명을 명시해 주면 된다.

**src/auth/user.entity.ts**
```
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

현재 상태에서 같은 사용자 이름으로 회원가입을 두 번 시도하면 Internal Server Error가 발생한다. 하지만 이는 바람직하지 않다. 만약 REST API 규칙에 맞추어 서버를 설계하는 상황이라면 다른 처리를 해주어야 할 것이다.

이를 위해 try-catch 문법을 사용해 해당 오류가 발생하는 지점에서 적절하게 예외 처리를 해주어야 한다. 현재는 리포지토리 계층의 `save()` 메서드에서 발생함을 알 수 있다.

**src/auth/user.repository.ts**
```
...
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      const { username, password } = authCredentialsDto;

      const user = this.repository.create({
        username,
        password,
      });

      await this.repository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
...
```