
const changeLikeUser = async (posts, userid) => {
   let result
   if(userid){
      result = await posts.map((post) => {
         const isLike = post.like.includes(userid)
         return {...post, countLike: post.like.length, like: isLike}
      })
   }
   else{
      result = await posts.map((post) => {
         return {...post, countLike: post.like.length, like: false}
      })
   }
   return result;
}


module.exports = {changeLikeUser}