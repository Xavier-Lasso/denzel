let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let movieSchema = new Schema({ link: String, id: String, metascore: Number, poster: String, rating: Number, synopsis: String, title: String, votes: Number, year: Number });
let Movie = mongoose.model('Movie', movieSchema);

const importDatabase = movies => {
  movies.forEach(movie => {
      Movie.countDocuments({id: movie.id}, function (err, count){
          if(count === 0){
              let newMovie = Movie({ link: movie.link, id: movie.id, metascore: movie.metascore, poster: movie.poster, rating: movie.rating, synopsis: movie.synopsis, title: movie.title, votes: movie.votes, year: movie.year });
              newMovie.save(function (err) {
                  if(err) {
                      return handleError(err);
                  }
              });
          }
      });
  });
};

const countAllDocuments = () => {
    return Movie.countDocuments({})
        .then(count => { return count; })
        .catch(e => { console.log(e); });
};

const getMovieById = movieId => {
    return Movie.find({id: movieId})
        .then(movie => { return movie; })
        .catch(e => { console.log(e); });
};

const getRandomMustWatchMovie = () => {
    return Movie.countDocuments({metascore: {$gte: 70}})
        .then(count => {
            let random = Math.floor(Math.random() * count);
            return Movie.findOne({metascore: {$gte: 70}}).skip(random)
                .then(res => { return res; })
                .catch(e => { console.log(e); });
        })
        .catch(e => { console.log(e); });
};

const getRandomMovie = () => {
    return Movie.countDocuments({})
        .then(count => {
            let random = Math.floor(Math.random() * count);
            return Movie.findOne().skip(random)
                .then(res => { return res; })
                .catch(e => { console.log(e); });
        })
        .catch(e => { console.log(e); });
};

const searchMovie = (limit, metascore) => {
    if(typeof limit !== 'undefined' && typeof metascore !== 'undefined') {
        return Movie.find({metascore: {$gte: metascore}}).limit(parseInt(limit))
            .then(res => { return res; })
            .catch(e => { console.log(e); });
    }
    else {
        if (typeof limit === 'undefined' && typeof metascore === 'undefined') {
            return Movie.find()
                .then(res => { return res; })
                .catch(e => { console.log(e); });
        }
        else {
            if (typeof limit === 'undefined') {
                return Movie.find({metascore: {$gte: metascore}})
                    .then(res => {
                        return res;
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
            if (typeof metascore === 'undefined') {
                return Movie.find().limit(parseInt(limit))
                    .then(res => {
                        return res;
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
        }
    }
};

exports.importDatabase = importDatabase;
exports.countAllDocuments = countAllDocuments;
exports.getRandomMovie = getRandomMovie;
exports.getRandomMustWatchMovie = getRandomMustWatchMovie;
exports.getMovieById = getMovieById;
exports.searchMovie = searchMovie;
