import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

    @Get()
  getMovies(@Query('title', MovieTitleValidationPipe) title?: string) {
    return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getMovieById(id);
  }

  @Post()
  postMovie(@Body() body: CreateMovieDTO) {
    return this.movieService.createMovie(body);
  }

  // // Put vs Patch
  @Patch(':id')
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDTO) {
    return this.movieService.updateMovie(id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number){
    return this.movieService.deleteMovie(id);
  }
}
