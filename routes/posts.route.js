const express = require('express');
const router = express.Router();
const Post = require('../models/Post.model');
const User = require('../models/User')
const Bookmark = require('../models/BookmarkUser')
const date = require('../services/date.service')
const {changeUserPost} = require('../middleware/postMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const { changeLikeUser } = require('../services/like.service')
const uploadMiddleware = require('../middleware/uploadMiddleware')
const { userIdData } = require('../services/user.service')
const { editСomments } = require('../services/post.service')

const upload = uploadMiddleware.single('posts')
router.post('/upload', upload, verifyToken, (req, res) =>{
  try {
    res.json(req.file.fileId)
  }
  catch(err){
    res.status(400).json({ message: 'Не удалось обновить фото аватарки' })
  }
})

const PAGE_SIZE = 6;


// GET api/posts/like/:postId - Поставть / удалить лайк с поста
router.get('/like/:postId', verifyToken, async (req, res) => {
   await Post.findById(req.params.postId)
      .then(async post => {
         //Проверка на лайк
         const isLike = post.like.includes(req.user._id)

         if(isLike){
            const likes = post.like.filter(item => {
               return item !== req.user._id
            })
            await Post.findByIdAndUpdate(post._id, {like: likes})
               .then(result => {res.json({ message: 'Лайк успешно удален', status: false })})
               .catch(err => res.status(400).json({ error: 'Ошибка удаления лайка' }));
         }
         else{
            await Post.findByIdAndUpdate(post._id, {
               like: [...post.like, req.user._id]
            })
            .then(result => {res.json({ message: 'Лайк успешно добавлен', status: true })})
            .catch(err => res.status(400).json({ error: 'Ошибка добавления лайка' }));
         }
      })
      .catch(err => res.status(400).json({ error: 'Пост не найден' }));
});

// GET api/posts/comments/add - Добавить коментарий, postId
router.post('/comments/add', verifyToken, async (req, res) => {
   const {comment, postId} = req.body
   if(comment !== undefined && postId !== undefined){
      const commentData = {
         userId: req.user._id,
         comment: comment
      }

      await Post.findByIdAndUpdate(postId, {
         $addToSet: {comments: commentData}
      })
      .then(postData => {
         Post.findById(postId)
         .then(async post => {
            if(post.comments.length > 0){
               const newComment = post.comments[post.comments.length - 1]
               const user = await userIdData(newComment.userId)
               const commentDate = await date.calcMinutes(newComment.date)

               return res.status(200).json({
                  _id: newComment._id,
                  userId: newComment.userId,
                  name: user.name,
                  comment: newComment.comment,
                  datе: commentDate
               })
            }
            else{
               return res.status(400).json({ error: 'Не удалось найти комментарий' })
            }
         })
      })
      .catch(err => res.status(400).json({ error: 'Не удалось добавить комментарий' }));
      
   }
   else{
      res.status(400).json({ error: 'Некорректные данные комментария' });
   }
});


// GET api/posts/all - Получить все посты незарегистрированых пользователей
router.get('/global/all', async (req, res) => {
   const page = parseInt(req.query.page || '1') - 1
   const totalPages = await Post.countDocuments({})

   Post.find()
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({date:-1}) 
      .then(async posts =>{
         let postsData = []
         const nowData = new Date()
         for(post of posts){
            const userData = await User.findById(post.userId)
            await postsData.push({
               ...post._doc, 
               userName: userData.name, 
               imgUrlAvatar: userData.imgUrlAvatar,
               dateTitle: date.calcMinutes(post.date, nowData),
            })
         }
         postsData = await changeLikeUser(postsData)
         res.json({
            page: page + 1,
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            posts: postsData
         })
      })
      .catch(err => {
         console.log(err)
         res.status(404).json({ nobooksfound: 'Посты не найдены' })});
});


// GET api/posts - Получить все посты
router.get('/all', verifyToken, async (req, res) => {
   const page = parseInt(req.query.page || '1') - 1
   const totalPages = await Post.countDocuments({})
   
   Post.find()
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({date:-1}) 
      .then(async posts =>{
         let postsData = []
         const nowData = new Date()
         for(post of posts){
            const userData = await User.findById(post.userId)
            const isBookmark = await Bookmark.findOne({userId: req.user._id, postId: post._id})

            const comments = await editСomments(post.comments)

            await postsData.push({
               ...post._doc, 
               commentsCount: post?.comments.length?post.comments.length:0,
               comments: comments,
               userName: userData.name, 
               imgUrlAvatar: userData.imgUrlAvatar,
               dateTitle: date.calcMinutes(post.date, nowData),
               isBookmark: !!isBookmark
            })
         }
         postsData = await changeLikeUser(postsData, req.user._id)
         res.json({
            page: page + 1,
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            posts: postsData
         })
      })
      .catch(err => {
         console.log(err)
         res.status(404).json({ nobooksfound: 'Посты не найдены' })});
});


// GET api/posts - Получить все посты подпсок
router.get('/following', verifyToken, async (req, res) => {
   const user = await User.findById(req.user._id)
   const arrFollowing = user.following
   arrFollowing.push(user._id)

   const page = parseInt(req.query.page || '1') - 1
   const totalPages = await Post.countDocuments({})

   Post.find({ userId: { $in: arrFollowing } })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({date:-1}) 
      .then(async posts =>{
         let postsData = []
         const nowData = new Date()
         for(post of posts){
            const userData = await User.findById(post.userId)
            const isBookmark = await Bookmark.findOne({userId: req.user._id, postId: post._id})
            const comments = await editСomments(post.comments)


            await postsData.push({
               ...post._doc, 
               commentsCount: post?.comments.length?post.comments.length:0,
               comments: comments,
               userName: userData.name, 
               dateTitle: date.calcMinutes(post.date, nowData),
               imgUrlAvatar: userData.imgUrlAvatar,
               isBookmark: !!isBookmark
            })
         }
         postsData = await changeLikeUser(postsData, req.user._id)
         res.json({
            page: page + 1,
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            posts: postsData
         })
      })
      .catch(err => {
         console.log(err)
         res.status(404).json({ nobooksfound: 'Посты не найдены' })});
});


// GET api/posts - Получить все избранные посты
router.get('/bookmark/all', verifyToken, async (req, res) => {
   const totalPages = await Post.countDocuments({})
   Bookmark.find({ userId: req.user._id})
      .sort({date:-1}) 
      .then(async posts =>{
         let postsData = []
         const nowData = new Date()
         for(post of posts){
            const postData = await Post.findById(post.postId)
            if(postData){
               const userData = await User.findById(postData.userId)
               const comments = await editСomments(postData.comments)

               await postsData.unshift({
                  ...postData._doc, 
                  commentsCount: postData?.comments.length?postData.comments.length:0,
                  comments: comments,
                  userName: userData.name, 
                  dateTitle: date.calcMinutes(postData.date, nowData),
                  imgUrlAvatar: userData.imgUrlAvatar,
                  isBookmark: true
               })
            }
         }
         postsData = await changeLikeUser(postsData, req.user._id)
         res.json({
            page: 1,
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            posts: postsData
         })
      })
      .catch(err => {
         console.log(err)
         res.status(404).json({ message: 'Посты не найдены' })});
});

// GET api/posts - Получить все посты одного пользователя
router.get('/all/:userId', verifyToken, async (req, res) => {
   const page = parseInt(req.query.page || '1') - 1
   const totalPages = await Post.countDocuments({})

   Post.find({userId: req.params.userId})
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({date:-1}) 
      .then(async postsUser =>{
         let postsData = []
         const nowData = new Date()
         let userData = await User.findById(req.params.userId)

         for(post of postsUser){
            const isBookmark = await Bookmark.findOne({userId: req.user._id, postId: post._id})
            const comments = await editСomments(post.comments)

            await postsData.push({
               ...post._doc, 
               commentsCount: post?.comments.length?post.comments.length:0,
               comments: comments,
               userName: userData.name, 
               dateTitle: date.calcMinutes(post.date, nowData),
               imgUrlAvatar: userData.imgUrlAvatar,
               isBookmark: !!isBookmark
            })
         }
         postsData = await changeLikeUser(postsData, req.user._id)
         res.json({
            page: page + 1,
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            posts: postsData
         })
      })
      .catch(err => {
         console.log(err)
         res.status(404).json({ nobooksfound: 'Посты не найдены' })});
});

// GET api/posts - Добавить/сохранить пост
router.post('/', verifyToken, (req, res) => {
   Post.create(req.body)
      .then(async post => {
         const userData = await User.findById(post.userId)
         const postsData = await ({
            ...post._doc, 
            commentsCount: 0,
            comments: [],
            userName: userData.name, 
            imgUrlAvatar: userData.imgUrlAvatar,
            dateTitle: "Только что"
         })
         res.json(postsData)
      })
      .catch(err => res.status(400).json({ error: 'Не удалось добавить пост' }));
});

// GET api/posts/:id - Обновить пост
// router.put('/:id', (req, res) => {
//    Post.findByIdAndUpdate(req.params.id, req.body)
//       .then(post => res.json(post))
//       .catch(err =>
//          res.status(400).json({ error: 'Невозможно обновить базу данных' })
//       );
// });

// GET api/posts/:id - Удалить пост
router.delete('/:id', changeUserPost, (req, res) => {
   Post.findByIdAndRemove(req.params.id)
      .then(post => {
         Bookmark.findOneAndRemove({postId: req.params.id})
            .then(bookmark => 
               res.json({ message: 'Запись в посте успешно удалена' })
            )
      })
      .catch(err => res.status(404).json({ error: 'Нет такого поста' }));
});

module.exports = router;