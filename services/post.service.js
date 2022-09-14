const { userIdData } = require('./user.service')
const date = require('./date.service')


const editСomments = async (comments) => {
   let newComments = []
   for(comment of comments){
      let user = await userIdData(comment.userId)

      await newComments.push({
         _id: comment._id,
         userId: comment.userId,
         name: user.name,
         imgUrlAvatar: user.imgUrlAvatar,
         comment: comment.comment,
         data: date.calcMinutes(comment.date)
      })
   }
   return newComments;
}


module.exports = {editСomments}