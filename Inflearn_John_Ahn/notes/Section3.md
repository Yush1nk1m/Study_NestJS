# Section 3. CRUD 구현

## 모든 게시물을 가져오는 서비스 만들기

이 로직은 데이터베이스 조작 로직이므로 서비스에서 처리할 수 있다. 우선 메모리 기반으로 작업을 시작한다.

**src/boards/boards.service.ts**
```
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private boards = [];

  getAllBoards() {
    return this.boards;
  }
}
```

이제 `getAllBoards()` 메서드가 실제로 호출되게 하기 위해서 컨트롤러 코드를 수정한다.

**src/boards/boards.controller.ts**
```
import { Controller, Get } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  getAllTask() {
    return this.boardsService.getAllBoards();
  }
}
```

서버를 실행하고 http://localhost:3000/boards에 접속하거나 포스트맨을 사용해 응답을 확인할 수 있다.

### 정리

다음과 같은 흐름으로 클라이언트의 요청이 처리되고 있다.

1. 클라이언트에서 요청을 보내면 먼저 컨트롤러가 이를 받는다.
2. 컨트롤러가 알맞은 요청 경로 및 메서드로 라우팅하여 해당 핸들러로 이동한다.
3. 세부적인 로직을 처리하기 위해 서비스를 호출한다.
4. 서비스가 로직을 처리한 후 결과를 컨트롤러에 반환한다.
5. 컨트롤러는 클라이언트에 응답을 보낸다.