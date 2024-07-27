import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly repository: Repository<Board>,
  ) {}

  async findOneById(id: number): Promise<Board> {
    return this.repository.findOne({ where: { id } });
  }
}
