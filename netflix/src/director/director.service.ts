import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director) private readonly directorRepository: Repository<Director>
  ) {}

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorRepository.save(createDirectorDto);
  }

  findAll() {
    return this.directorRepository.find();
  }

  findOne(id: number) {
    return this.directorRepository.findOne({where: {id}});
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = this.directorRepository.findOne({
      where: {id}
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 감독입니다!')
    }

    await this.directorRepository.update(
      {id},
      {...updateDirectorDto}
    )

    const newDirector = this.directorRepository.findOne({
      where: {id}
    });

    return newDirector;
  }

  async remove(id: number) {
    const director = this.directorRepository.findOne({
      where: {id}
    });

    if (!director) {
      throw new NotFoundException("존재하지 않는 감독입니다!")
    }
    
    await this.directorRepository.delete(id);

    return id;
  }
}
