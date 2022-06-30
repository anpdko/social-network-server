require('dotenv').config()
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Post = require('../models/Post.model')

const changeUserPost = asyncHandler(async (req, res, next)=> {
   let token;
   if(req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer')){
      try {
         token = req.headers['authorization'].split(' ')[1]
         const decoded = jwt.verify(token, process.env.JWT_SECRET)

         const user = await User.findById(decoded.userId).select('-password')
         req.user = user;

         const reqUser = await Post.findById(req.params.id)

         if(String(reqUser.userId) === String(user._id)){
            next()
         }
         else{
            res.status(401).json({ message: 'Недостаточно прав' });
         }
      }
      catch(error){
         res.status(401).json({ message: 'Пользователь, не авторизован' });
      }
   }
   if(!token) {
      res.status(401).json({ message: 'Неверный токен авторизации' });
   }
})

module.exports = {changeUserPost}