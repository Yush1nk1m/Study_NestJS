import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardStatus } from './board-status.enum';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly repository: Repository<Board>,
  ) {}

  async getBoardById(id: number): Promise<Board> {
    return this.repository.findOne({ where: { id } });
  }

  async getAllBoards(): Promise<Board[]> {
    return this.repository.find();
  }

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const { title, description } = createBoardDto;

    const board = this.repository.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
    });

    await this.repository.save(board);

    return board;
  }

  async deleteBoard(id: number): Promise<void> {
    const result = await this.repository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Cannot find a Board with id ${id}`);
    }
  }

  async updateBoardStatus(board: Board, status: BoardStatus): Promise<Board> {
    board.status = status;
    return this.repository.save(board);
  }
}
