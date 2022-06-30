const {Schema, model, Types} = require('mongoose')

var schema = new Schema({
   userId: {
      type: Types.ObjectId, 
      required: true,
      ref: 'User'
   },
   postId: {
      type: Types.ObjectId, 
      required: true,
      ref: 'Post'
   },
});

module.exports = model('Bookmark', schema)