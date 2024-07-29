import { Injectable, NotFoundException } from '@nestjs/common';
import { Board } from './board.entity';
import { BoardStatus } from './board-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardRepository } from './board.repository';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardsService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getAllBoards(user: User): Promise<Board[]> {
    return this.boardRepository.getAllBoards(user);
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto, user);
  }

  async getBoardById(id: number): Promise<Board> {
    const found = await this.boardRepository.getBoardById(id);

    if (!found) {
      throw new NotFoundException(`Cannot find a Board with id ${id}`);
    }

    return found;
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    return this.boardRepository.deleteBoard(id, user);
  }

  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.boardRepository.getBoardById(id);
    return await this.boardRepository.updateBoardStatus(board, status);
  }
}
