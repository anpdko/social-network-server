const User = require('../models/User')


const addFollowingUser = async (myUser, youUser) => {
   let result = null;
   await User.findByIdAndUpdate(myUser._id, {
      following: [...myUser.following, youUser._id]
   })
   .then(user => result = user)
   return result;
}

const addFollowersUser = async (myUser, youUser) => {
   let result = null;
   await User.findByIdAndUpdate(youUser._id, {
      followers: [...youUser.followers, myUser._id]
   })
   .then(user => result = user)
   return result;
}

const delayFollowingUser = async (myUser, youUser) => {
   let result = null;
   const following = await myUser.following.filter(item => {
      return String(item) !== String(youUser._id)
   })
   await User.findByIdAndUpdate(myUser._id, {following: following})
      .then(user => result = user)
   return result;
}

const delayFollowersUser = async (myUser, youUser) => {
   let result = null;
   const followers = await youUser.followers.filter(item => {
      return String(item) !== String(myUser._id)
   })
   await User.findByIdAndUpdate(youUser._id, {followers: followers})
      .then(user => result = user)

   return result;
}

module.exports = {addFollowingUser, addFollowersUser, delayFollowingUser, delayFollowersUser}