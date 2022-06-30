const {verifyToken} = require('../middleware/authMiddleware')
const User = require('../models/User')
const Post = require('../models/Post.model')

const express = require('express');
const router = express.Router();

// GET api/people/all - Получить всех пользователей
router.get('/all', verifyToken, (req, res) => {
   User.find()
      .then(async users => {
         let dataUsers = [];
         for(let user of users){
            if(String(req.user._id) !== String(user._id)){
               let isFollower =  user.followers.includes(req.user._id);
               dataUsers.push({
                  _id: user._id,
                  email: user.email,
                  name: user.name,
                  imgUrlAvatar: user.imgUrlAvatar,
                  countFollowers: user.followers?user.followers.length:0,
                  countFollowing: user.following?user.following.length:0,
                  discription: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae quod voluptatum distinctio facilis rerum exercitationem assumenda quam impedit nemo velit voluptatem.",
                  isFollower: isFollower
               })
            }
         }
         res.json(dataUsers)
      })
      .catch(err => res.status(400).json({ nobookfound: 'Пользователи не найдены' }));
});

// GET api/people/followers/:id - Получить всех пользователей
router.get('/followers/:id', verifyToken, (req, res) => {
   User.findById(req.params.id)
   .then(async myUser => {
      let dataUsers = [];
      if(!!myUser.followers.length){
         for(let followersUserId of myUser.followers){
            let user = await User.findById(followersUserId)
            if(!!user){
               let isFollower =  await  String(req.user._id) !== String(user._id)?user.followers.includes(req.user._id):null
               await dataUsers.push({
                  _id: user._id,
                  email: user.email,
                  name: user.name,
                  imgUrlAvatar: user.imgUrlAvatar,
                  countFollowers: user.followers?user.followers.length:0,
                  countFollowing: user.following?user.following.length:0,
                  discription: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae quod voluptatum distinctio facilis rerum exercitationem assumenda quam impedit nemo velit voluptatem.",
                  isFollower: isFollower
               })
            }
            else{
               res.status(400).json({ nobookfound: 'Ошибка поиска пользователей' })
            }
         }
         res.json(dataUsers)
      }
      else{
         res.json([])
      }
   })
   .catch(err => res.status(400).json({ nobookfound: 'Пользователи не найдены' }));
});


// GET api/people/following/:id - Получить всех пользователей
router.get('/following/:id', verifyToken, (req, res) => {
   User.findById(req.params.id)
   .then(async myUser => {
      let dataUsers = [];
      if(!!myUser.following.length){
         for(let followingUserId of myUser.following){
            let user = await User.findById(followingUserId)
            if(!!user){
               let isFollower =  await  String(req.user._id) !== String(user._id)?user.followers.includes(req.user._id):null
               await dataUsers.push({
                  _id: user._id,
                  email: user.email,
                  name: user.name,
                  imgUrlAvatar: user.imgUrlAvatar,
                  countFollowers: user.followers?user.followers.length:0,
                  countFollowing: user.following?user.following.length:0,
                  discription: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae quod voluptatum distinctio facilis rerum exercitationem assumenda quam impedit nemo velit voluptatem.",
                  isFollower: isFollower
               })
            }
            else{
               console.log("user: ")
               console.log(user)
               res.status(400).json({ nobookfound: 'Ошибка поиска пользователей' })
            }
         }
         res.json(dataUsers)
      }
      else{
         res.json([])
      }
   })
   .catch(err => res.status(400).json({ nobookfound: 'Пользователи не найдены' }));
});



 module.exports = router