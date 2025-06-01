import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  
  private idCounter = 3;

  constructor(
    @InjectRepository(Movie) private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail) private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director) private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {}

  async getManyMovies(title?: string) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
    .leftJoinAndSelect('movie.director', 'director')
    .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', {title: `%${title}%`})
    }

    return await qb.getManyAndCount();

    // if (!title) {
    //   return this.movieRepository.find({
    //     relations: ['director'] 
    //   });
    // }

    // return this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`)
    //   },
    //   relations: ['director']
    // })
    
  }

  async getMovieById(id: number) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
    .leftJoinAndSelect('movie.director', 'director')
    .leftJoinAndSelect('movie.genres', 'genres')
    .leftJoinAndSelect('movie.detail', 'detail')
    .where('movie.id = :id', {id})
    .getOne();

    return qb;
  }

  async createMovie(createMovieDTO: CreateMovieDTO) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const director = await qr.manager.findOne(Director, {
        where: {id: createMovieDTO.directorId}
      });

      if (!director) {
        throw new NotFoundException("존재하지 않는 감독입니다!");
      }

      const genres = await qr.manager.find(Genre, {
        where: {id: In(createMovieDTO.genreIds)}
      });

      if (genres.length !== createMovieDTO.genreIds.length) {
        throw new NotFoundException("존재하지 않는 장르가 있습니다!");
      }

      const movie = await qr.manager.save(Movie, {
        title: createMovieDTO.title,
        detail: {detail: createMovieDTO.detail},
        director: director,
        genres: genres
      });

      await qr.commitTransaction();

      return movie;
    } catch(e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async updateMovie(id: number, updateMovieDTO: UpdateMovieDTO){
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: {id},
        relations: ['detail']
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 영화 ID입니다!');
      }

      const {detail, directorId, genreIds, ...movieRest} = updateMovieDTO;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: {id: directorId}
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 감독입니다!');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: {
            id: In(genreIds)
          }
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException("존재하지 않는 장르가 있습니다!")
        }

        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && {director: newDirector})
      }

      await qr.manager.update(Movie, 
        {id},
        movieUpdateFields,
      );

      if (detail) {
        await qr.manager.update(MovieDetail,
          {id: movie.detail.id},
          {detail},
        )
      }

      const newMovie = await qr.manager.findOne(Movie, {
        where: {id},
        relations: ['detail', 'director']
      });

      if (!newMovie) {
        throw new NotFoundException('업데이트 후 영화를 찾을 수 없습니다');
      }

      newMovie.genres = newGenres

      await qr.manager.save(Movie, newMovie);

      await qr.commitTransaction();
      return newMovie;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
    
  }

  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화 ID입니다!');
    }

    this.movieRepository.delete(id);
    this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
