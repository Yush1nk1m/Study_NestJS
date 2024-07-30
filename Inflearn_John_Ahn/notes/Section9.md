# Section 9. 로그 남기기

## 로그에 대해서

애플리케이션을 운영할 때는 로그를 보는 것이 중요하다. 이번에는 NestJS에서 로깅하는 방법에 대해 알아보자.

### 로그의 종류

- **Log**: 중요한 정보에 대한 범용 로그
- **Warning**: 치명적이거나 파괴적이지 않은, 처리되지 않은 문제
- **Error**: 치명적이거나 파괴적인, 처리되지 않은 문제
- **Debug**: 오류 발생 시 디버깅에 도움이 되는 유용한 정보, 개발자용
- **Verbose**: 응용 프로그램의 동작에 대한 통찰력을 제공하는 정보, 운영자용

### 로그 레벨

환경에 따라 로그의 레벨을 정의하여 넣어줄 수 있다.

|               | Log   | Error | Warning   | Debug | Verbose   |
| :--:          | :--:  | :--:  | :--:      | :--:  | :--:      |
| **Development**   | O     | O     | O         | O     | O         |
| **Staging**       | O     | O     | O         | X     | X         |
| **Production**    | O     | O     | X         | X     | X         |

## 애플리케이션에 로그 적용하기

Express.js를 사용할 때는 `Winston`이란 모듈을 주로 사용하지만, NestJS에는 내장 모듈인 `logger` 클래스가 있다. 기존에 개발한 애플리케이션들의 중요한 부분에 로깅을 적용해 보겠다.

먼저 서버가 실행되는 main 파일에 대해 로깅을 적용하자.

**src/main.ts**
```
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;
  await app.listen(port);
  Logger.log(`Application is running on port ${port}`);
}
bootstrap();
```

다음으로는 Boards 컨트롤러에 로깅을 적용하자.

**src/boards/boards.controller.ts**
```
...
export class BoardsController {
  private logger = new Logger('BoardsController');
...
  @Get()
  getAllBoards(@GetUser() user: User): Promise<Board[]> {
    this.logger.verbose(`User "${user.username}" is trying to get all boards.`);
    return this.boardsService.getAllBoards(user);
  }
...
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    this.logger.verbose(`User "${user.username}" is creating a new board.
      Payload: ${JSON.stringify(createBoardDto)}`);
    return this.boardsService.createBoard(createBoardDto, user);
  }
...
```