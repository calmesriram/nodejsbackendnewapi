 
var mongoose = require('mongoose');

var news = new mongoose.Schema({
    newsid:{
        type:String
    },
    title:{
        type:String
    },
    description: {
        type: String
    },
    imageid: {
        type: String
    },
    imageurl: {
        type: String
    },
    imagedet: [],
    tags: {
        type: String
    },
    createdon: {
        type: String,
        default:Date.now()
    },

})
module.exports = mongoose.model('news', news);