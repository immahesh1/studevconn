const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users' //user collection
  },
  text: {
    type: String,
    required: true
  },
  //each post should have the name and avatar if users profile is deleted
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  //if user likes the post then user id will be inserted into array if dislikes then that user id will be removed
  //and one user can not make more than one likes
  //likes is an array of objects
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
