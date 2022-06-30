const {verifyToken} = require('../middleware/authMiddleware')
const User = require('../models/User')
const Post = require('../models/Post.model')
const express = require('express');
const router = express.Router();
const {addFollowingUser, addFollowersUser, delayFollowingUser, delayFollowersUser} = require('../services/user.service');

// const fileMiddleware = require('../middleware/fileMiddeleware')
const uploadMiddleware = require('../middleware/uploadMiddleware');

// GET api/user/all - Получить все
router.get('/all', verifyToken, (req, res) => {
   User.find()
    .then(user =>{
      res.json(user)
    })
    .catch(err => {
      res.status(400).json({ nobooksfound: 'Пользователи не найдены' })});
});


// const upload = fileMiddleware.single('user')
const upload = uploadMiddleware.single('user')

router.post('/upload', upload, verifyToken, (req, res) =>{
  console.log(req.file)
  if(!!req.file.fileId){
    User.findByIdAndUpdate(req.user._id, {imgUrlAvatar: req.file.fileId})
    .then(async user => {
      res.json(req.file.fileId)
    })
    .catch(error => {
      res.status(400).json({ message: 'Не удалось обновить фото аватарки' })
    })
  }
  else{
    res.status(400).json({ message: 'Файл аватарки не найден. Не удалось обновить фото аватарки' })
  }
})

// GET api/user/:id - Получить данные одного пользователя
router.get('/:id', verifyToken, (req, res) => {
  User.findById(req.params.id)
    .then(async user => {
      const countPosts = await Post.find({userId: req.params.id}).count()

      let isFollower = null;
      if(String(req.params.id) !== String(req.user._id)){
        isFollower = user.followers?user.followers.includes(req.user._id):false
      }

      res.json({
        _id: user._id,
        email: user.email,
        name: user.name,
        imgUrlAvatar: user.imgUrlAvatar,
        countPosts: countPosts,
        countFollowers: user.followers?user.followers.length:0,
        countFollowing: user.following?user.following.length:0,
        discription: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae quod voluptatum distinctio facilis rerum exercitationem assumenda quam impedit nemo velit voluptatem.",
        isFollower: isFollower
      })
    })
    .catch(err => res.status(400).json({ nobookfound: 'Пользователь не найден' }));
});


// GET api/user/following/:id - Подписаться
// Добавить в myUser массив following подписавшигося 
// Добавить в youUser массив followers пользователя на которого подписались
router.get('/following/:id', verifyToken, async (req, res) => {
  if(req.user._id === req.params.id) {
    return res.status(400).json({ message: 'Нельзя подписаться на самого себя' })
  }
  const myUser = await User.findById(req.user._id)
  const youUser = await User.findById(req.params.id)
  if(myUser === null || youUser === null){
    return res.status(400).json({ message: 'Пользователь не найден'});
  }

  const isFollowing = await myUser.following?myUser.following.includes(youUser._id):null
  if(!!!isFollowing){ 
    /////////////////////////Подписка/////////////////////////
    console.log('Подписка!')
    const isAddFollowing = await addFollowingUser(myUser, youUser)
    if(isAddFollowing === null){
      return res.status(400).json({ message: 'Не удалось подписаться'});
    }
    const isFollowers = await youUser.followеrs?youUser.followеrs.includes(myUser._id):null
    if(isFollowers === null){
      const isAddFollowers = await addFollowersUser(myUser, youUser)
      if(isAddFollowers === null){
        return res.status(400).json({ message: 'Не удалось подписаться'});
      }
    }
    return res.status(200).json({ message:'Подписка успешно завершена'});
  }
  else{
    /////////////////////////Отвписка/////////////////////////
    console.log('Отвписка!')
    const isDelayFollowing = await delayFollowingUser(myUser, youUser)
    const isDelayFollowers = await delayFollowersUser(myUser, youUser)
    if(isDelayFollowing === null || isDelayFollowers === null){
      return res.status(404).json({ message:'отшибка отписки'});
    }

    return res.status(200).json({ message:'Отписка успешно завершена'});
  }
});


router.get('/subscribe/:id', verifyToken, async (req, res) => {
  if(req.user._id === req.params.id) {
    return res.status(400).json({ message: 'Нельзя подписаться на самого себя' })
  }
  const myUser = await User.findById(req.user._id)
  const youUser = await User.findById(req.params.id)
  if(myUser === null || youUser === null){
    return res.status(400).json({ message: 'Пользователь не найден'});
  }
  const isFollowing = await myUser.following?myUser.following.includes(youUser._id):null
  if(!!!isFollowing){
    console.log('Подписка!')
    const isAddFollowing = await addFollowingUser(myUser, youUser)
    if(isAddFollowing === null){
      return res.status(400).json({ message: 'Не удалось подписаться'});
    }
    const isFollowers = await youUser.followеrs?youUser.followеrs.includes(myUser._id):null
    if(isFollowers === null){
      const isAddFollowers = await addFollowersUser(myUser, youUser)
      if(isAddFollowers === null){
        return res.status(400).json({ message: 'Не удалось подписаться'});
      }
    }
    return res.status(200).json({ message:'Подписка успешно завершена'});
  }
  else{
    return res.status(400).json({ message:'Вы уже подписанны!'});
  }
})

router.get('/unsubscribe/:id', verifyToken, async (req, res) => {
  if(req.user._id === req.params.id) {
    return res.status(400).json({ message: 'Нельзя подписаться на самого себя' })
  }
  const myUser = await User.findById(req.user._id)
  const youUser = await User.findById(req.params.id)
  if(myUser === null || youUser === null){
    return res.status(400).json({ message: 'Пользователь не найден'});
  }
  const isFollowing = await myUser.following?myUser.following.includes(youUser._id):null
  if(!!isFollowing){
    console.log('Отвписка!')
    const isDelayFollowing = await delayFollowingUser(myUser, youUser)
    const isDelayFollowers = await delayFollowersUser(myUser, youUser)
    if(isDelayFollowing === null || isDelayFollowers === null){
      return res.status(404).json({ message:'Ошибка отписки'});
    }

    return res.status(200).json({ message:'Отписка успешно завершена'});
  }
  else{
    return res.status(400).json({ message:'Вы уже отписанны!'});
  }
})

module.exports = router