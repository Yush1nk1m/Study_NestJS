# Section 4. Pipe 이용

## NestJS Pipes

파이프란 `@Injectable()` 데코레이터로 데코레이션된 클래스이다. 파이프는 **data transformation**, **data validation**을 위해 사용된다. 파이프는 컨트롤러의 라우터에 의해 처리되는 인수에 대해 작동한다.

NestJS는 메서드가 호출되기 직전에 파이프를 삽입하고, 파이프는 메서드로 향하는 인수를 수신한 뒤 이에 대해 작동한다.

![Pipe](images/Pipe.png)

### Data transformation

Data transformation이란 입력 데이터를 원하는 형식으로 변환하는 것이다. 예를 들어 숫자가 문자열 형식으로 전달된다면 이를 숫자로 파싱하는 것이다.

### Data validation

Data validation이란 입력 데이터를 평가하고 유효한 경우 변경되지 않은 상태로 전달하고, 유효하지 않으면 예외를 발생시키는 것이다. 예를 들어 형식에 맞는 이름이 입력되었을 경우 예외를 발생시킨다.

파이프는 위의 두 가지 경우 모두에서 라우트 핸들러가 처리하는 인수에 대해 작동한다.

### Pipe 사용하는 법(Binding Pipes)

파이프를 사용하는 방법은 다음의 세 가지로 나누어진다.

- Handler-level pipes
- Parameter-level pipes
- Global-level pipes

#### Handler-level pipes

핸들러에 `@UsePipes()` 데코레이터를 사용해 파이프를 사용할 수 있다. 이 파이프는 모든 파라미터에 적용이 된다.

#### Parameter-level pipes

핸들러의 파라미터의 `@Body()` 등에 파이프를 인자로 전달하여 파이프를 사용할 수 있다. 이 파이프는 일부 파라미터에만 적용이 된다.

#### Global-level pipes

애플리케이션 레벨의 파이프이다. **main.ts**에서 `app.useGlobalPipes()` 메서드로 사용할 수 있다. 이 파이프는 클라이언트로부터 들어오는 모든 요청에 대해 적용된다.

### Built-in pipes

NestJS는 기본적으로 다음과 같은 6가지의 내장 파이프를 제공한다.

- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe

이름을 통해 역할을 짐작할 수 있으며, 이 중 `ParseIntPipe`를 사용하는 예시는 다음과 같다. 예를 들어 파라미터 값으로 숫자가 와야 하는 핸들러가 있다고 하자.

```
...
@Get(:id)
findOne(@Param('id', ParseIntPipe) id: number) {
    ...
}
...
```

그러면 이렇게 `@Param()` 데코레이터의 인자로 직접 파이프를 전달하여 유효성 검사를 할 수 있다.

## 파이프를 이용한 유효성 검사

이번에는 게시물 생성 시 유효성 검사를 해보자. 지금은 게시물 생성 시 title, description에 빈 문자열을 보내도 게시물 생성이 된다. 이 부분을 수정할 것이다.

먼저 `class-validator`, `class-transformer` 두 가지의 모듈이 필요하므로 다음과 같이 설치한다.

```
$ npm i class-validator class-transformer --save
```

그리고 공식 문서(https://github.com/typestack/class-validator#manual-validation)를 참고하여 파이프를 작성한다.

**src/boards/dto/create-board.dto.ts**
```
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
```

DTO에 유효성 검사 데코레이터를 적용했다면 컨트롤러에서 실제로 파이프를 사용하도록 설정한다.

**src/boards/boards.controller.ts**
```
...
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(@Body() createBoardDto: CreateBoardDto): Board {
    return this.boardsService.createBoard(createBoardDto);
  }
...
```

내장 파이프인 `ValidationPipe`를 사용하기 위해 DTO를 데코레이션하고 이를 컨트롤러에 적용하였다. 이제 서버를 
실행하고 Postman을 사용해 빈 문자열을 데이터로 보내보자.

![ValidationPipe test](images/ValidationPipeTest.png)

빈 문자열 전송 시 서버가 예외를 발생시키는 것을 확인할 수 있다.