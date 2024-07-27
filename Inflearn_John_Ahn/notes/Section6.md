# Section 6. 데이터베이스를 이용한 CRUD 구현

## 데이터베이스를 위한 소스 코드 정리

데이터베이스 연동 후 CRUD를 구현하기 위해 기존에 작성한 메모리 기반의 소스 코드를 정리해야 한다. 그러므로 기존에 작성하였던 몇몇 부분을 삭제하거나 주석 처리해야 한다.

- 서비스와 컨트롤러 로직을 모두 주석 처리한다.
- 서비스에서 board 배열과 uuid 부분을 삭제한다.
- 엔티티를 사용하므로 board 모델에 있는 BoardInterface는 삭제한다.
- BoardStatus는 삭제하지 않고 파일 이름을 board-status.enum.ts로 변경한다.

## ID를 이용해 특정 게시물 조회하기

TypeORM을 사용해 Repository 패턴을 사용하기 위해서 서비스에 DI를 해 주어야 한다. 이를 위해 서비스 코드를 수정한다.

**src/boards/boards.service.ts**
```
...
constructor(private readonly boardRepository: BoardRepository) {}
...
```

생성자를 사용해 의존성을 주입한다.

### 서비스에서 getBoardById 메서드 생성하기

데이터베이스 작업을 구현하기 위해 다음과 같은 것들을 해야 한다.

- TypeORM에서 제공하는 `findOne()` 메서드 사용하기
- async/await 문법을 사용해 비동기 데이터베이스 작업을 위해 대기하기

먼저 리포지토리 계층에서 TypeORM의 `findOne()` 메서드를 사용해 `findOneById()` 메서드를 정의한다.

**src/boards/board.repository.ts**
```
...
  async findOneById(id: number): Promise<Board> {
    return this.repository.findOne({ where: { id } });
  }
...
```

주석 처리하였던 서비스 계층의 `getBoardById()` 메서드를 다음과 같이 재정의한다.

**src/boards/boards.service.ts**
```
...
  async getBoardById(id: number): Promise<Board> {
    const found = await this.boardRepository.findOneById(id);
    
    if (!found) {
      throw new NotFoundException(`Cannot find a Board with id ${id}`);
    }

    return found;
  }
...
```

마지막으로 컨트롤러에 연결해준다.

**src/boards/boards.controller.ts**
```
...
  @Get()
  getBoardById(@Param('id') id: number): Promise<Board> {
    return this.boardsService.getBoardById(id);
  }
...
```

아직 데이터베이스에 저장된 게시물은 없지만, Postman을 사용해 게시물을 조회하는 것이 가능한지 확인해 보자.

![GET boards/:id test](images/findOneByIdTest.png)

잘 작동함을 확인할 수 있다. 데이터베이스 연동 이후의 작업 과정은 다음과 같다.

1. 필요한 데이터베이스 로직을 리포지토리 계층에 정의한다.
2. 서비스 계층에서 리포지토리 계층에 정의된 메서드를 사용하여 비즈니스 로직을 구현한다.
3. 컨트롤러 계층에서는 서비스 계층의 메서드를 이용하여 클라이언트의 요청을 처리하고 응답한다.