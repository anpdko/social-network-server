const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true
   },
   name: {
      type: String,
      required: true,
   },
   password: {
      type: String,
      require: true
   },
   imgUrlAvatar: {
      type: String,
      default: null
   },
   followers: {
      type: [{
         type: Types.ObjectId,
         ref: "User"
      }],
   },
   following: {
      type: [{
         type: Types.ObjectId,
         ref: "User"
      }],
   }
})

module.exports = model('User', schema)