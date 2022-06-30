const express = require('express');
const router = express.Router();
const Bookmark = require('../models/BookmarkUser');

const {verifyToken} = require('../middleware/authMiddleware')


// GET api/bookmark/:postId - Добавить/сохранить пост
router.get('/:postId', verifyToken, async (req, res) => {

   const isBookmark = await Bookmark.findOne({userId: req.user._id, postId: req.params.postId})

   if(isBookmark === null){
      const bookmark = {
         userId: req.user._id,
         postId: req.params.postId
      }
      await Bookmark.create(bookmark)
         .then(result => {res.json({ message: 'Пост добавлен в избраное', status: true })})
         .catch(err => res.status(400).json({ error: 'Не удалось добавть в инстраное' }));
   }
   else{
      await Bookmark.remove({userId: req.user._id, postId: req.params.postId})
         .then(result => res.json({ message: 'Пост удален из избраного', status: false }))
         .catch(err => res.status(404).json({ error: 'Не удалось удалить пост из избраного' }));
   }

});

module.exports = router;