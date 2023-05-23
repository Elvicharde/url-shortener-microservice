const mongoose = require('mongoose');
mongoose.set('strictQuery', false);


const urlSchema = new mongoose.Schema({
  name: String,
  shortUrl: Number
});

const shortenedUrl = mongoose.model('shortened-url', urlSchema)

module.exports =  {
  mongoose, 
  shortenedUrl
};