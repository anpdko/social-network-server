const {Schema, model, Types} = require('mongoose')

var schema = new Schema({
   body: {
      type: String,
      required: true
   },
   userId: {
      type: Types.ObjectId, 
      required: true,
      ref: 'User'
   },
   date: {
      type: Date,
      default: Date.now
   },
   like: {
      type: [{
         type: Types.ObjectId,
         ref: "User"
      }],
   },
   comments: {
      type: [{
         userId: {
            type: Types.ObjectId,
            ref: "User"
         },
         comment: {
            type: String,
         },
         date: {
            type: Date,
            default: Date.now
         },
      }],
   }
});

module.exports = model('Post', schema)