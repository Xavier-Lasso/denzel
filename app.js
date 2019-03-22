let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let imdb = require('./src/imdb');
let movie = require('./src/movie');
let review = require('./src/review');
let expressGraphql = require('express-graphql');
let { buildSchema } = require('graphql');
const DENZEL_IMDB_ID = 'nm0000243';

mongoose.connect('mongodb://user1:esilvuser1@ds247430.mlab.com:47430/webapp-workshop4', { useNewUrlParser: true });

let schema = buildSchema(`
    type Query {
        populate : Int
        movies: [Movie]
        movie(id: String!): [Movie]
        search(limit: Int, metascore: Int): SearchResults
        review(idMovie: String!, date: String!, review: String!): String
    },
    type Movie {
        link: String
        metascore: Int
        synopsis: String
        title: String
        year: Int
    },
    type SearchResults {
        limit: Int
        results: [Movie]
        total: Int
    }
`);

let root = {
    populate: () => {
        importMovies();
        return movie.countAllDocuments();
    },
    movies: () => {
        list = [];
        list.push(movie.getRandomMustWatchMovie());
        return list;
    },
    movie: (args) => {
        return movie.getMovieById(args.id);
    },
    search: (args) => {
        return movie.searchMovie(args.limit, args.metascore)
            .then(movies => {
                if(typeof args.limit !== 'undefined') {
                    return {limit: args.limit, results: movies, total: movies.length};
                }
                else {
                    return {results: movies, total: movies.length};
                }
            })
    },
    review: (args) => {
        return review.addReview(args.idMovie, args.date, args.review)
    }
};

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/graphql', expressGraphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.use(express.static(__dirname + '/public'));

async function importMovies() {
    const movies = await imdb(DENZEL_IMDB_ID);
    movie.importDatabase(movies);
}

app.get('/', function (req, res) {
    res.sendfile('./public/index.html');
});

app.get('/movies/populate', function (req, res) {
    importMovies();
    let count = movie.countAllDocuments();
    count.then(total => {
        res.send({total: total});
    })
        .catch(e => { console.log(e); });
});

app.get('/movies', function (req, res) {
    let randomMovie = movie.getRandomMustWatchMovie();
    randomMovie.then(movie => {
        res.send(movie);
    })
        .catch(e => { console.log(e); });
});

app.get('/movies/search', function (req, res) {
    let limit = req.query.limit;
    let metascore = req.query.metascore;
    let result = movie.searchMovie(limit, metascore);
    result.then(movies => {
        if(typeof limit !== 'undefined') {
            res.send({limit: limit, results: movies, total: movies.length});
        }
        else {
            res.send({results: movies, total: movies.length});
        }
    })
        .catch(e => { console.log(e); });
});

app.get('/movies/:id', function (req, res) {
    let id = req.params.id;
    let result = movie.getMovieById(id);
    result.then(movie => {
        res.send(movie);
    })
        .catch(e => { console.log(e); });
});

app.post('/movies/:id', function (req, res) {
    let id = req.params.id;
    let date = req.body.date;
    let rev = req.body.review;
    let result = review.addReview(id, date, rev);
    result.then(id => {
        res.send({_id: id})
    })
        .catch(e => { console.log(e); });
});

app.listen(9292);
console.log('Listening on port 9292...');
