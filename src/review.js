let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let reviewSchema = new Schema({idMovie: String, date: Date, review: String});
let Review = mongoose.model('Review', reviewSchema);

const addReview = (idMovie, date, review) => {
    let newReview = Review(({idMovie: idMovie, date: date, review: review}));
    return newReview.save().then(res => {return res._id})
        .catch(e => { console.log(e); });
};

exports.addReview = addReview;
