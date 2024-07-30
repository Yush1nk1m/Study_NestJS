import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardStatus } from './board-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly repository: Repository<Board>,
  ) {}

  async getBoardById(id: number): Promise<Board> {
    return this.repository.findOne({ where: { id } });
  }

  async getAllBoards(user: User): Promise<Board[]> {
    const query = this.repository.createQueryBuilder('board');

    query.where('board.userId = :userId', { userId: user.id });

    const boards = await query.getMany();

    return boards;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;

    const board = this.repository.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
      user,
    });

    await this.repository.save(board);
    delete board.user;

    return board;
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    const result = await this.repository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Cannot find a Board with id ${id}`);
    }
  }

  async updateBoardStatus(board: Board, status: BoardStatus): Promise<Board> {
    board.status = status;
    return this.repository.save(board);
  }
}
