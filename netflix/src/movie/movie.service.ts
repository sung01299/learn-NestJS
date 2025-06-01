import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
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
  ) {}

  getManyMovies(title?: string) {
    if (!title) {
      return this.movieRepository.find({
        relations: ['director'] 
      });
    }

    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`)
      },
      relations: ['director']
    })
    
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {id},
      relations: ['detail', 'genres'],
    });

    return movie;
  }

  async createMovie(createMovieDTO: CreateMovieDTO) {
    const director = await this.directorRepository.findOne({
      where: {id: createMovieDTO.directorId}
    });

    if (!director) {
      throw new NotFoundException("존재하지 않는 감독입니다!");
    }

    const genres = await this.genreRepository.find({
      where: {id: In(createMovieDTO.genreIds)}
    });

    if (genres.length !== createMovieDTO.genreIds.length) {
      throw new NotFoundException("존재하지 않는 장르가 있습니다!");
    }

    const movie = await this.movieRepository.save({
      title: createMovieDTO.title,
      detail: {detail: createMovieDTO.detail},
      director: director,
      genres: genres
    });

    return movie;
  }

  async updateMovie(id: number, updateMovieDTO: UpdateMovieDTO){
    const movie = await this.movieRepository.findOne({
      where: {id},
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화 ID입니다!');
    }

    const {detail, directorId, genreIds, ...movieRest} = updateMovieDTO;

    let newDirector;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {id: directorId}
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 감독입니다!');
      }

      newDirector = director;
    }

    let newGenres;

    if (genreIds) {
      const genres = await this.genreRepository.find({
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

    await this.movieRepository.update(
      {id},
      movieUpdateFields,
    );

    if (detail) {
      await this.movieDetailRepository.update(
        {id: movie.detail.id},
        {detail},
      )
    }

    const newMovie = await this.movieRepository.findOne({
      where: {id},
      relations: ['detail', 'director']
    });

    if (!newMovie) {
      throw new NotFoundException('업데이트 후 영화를 찾을 수 없습니다');
    }

    newMovie.genres = newGenres

    await this.movieRepository.save(newMovie);

    return newMovie;
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
