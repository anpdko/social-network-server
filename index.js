require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true })); // cors
app.use(express.json({extensions: true})) //Для понимание сервером фаормата json

app.get('/', (req, res) => {
   res.send("Server listening on port 5000");
})


app.use('/static/images', express.static(path.join(__dirname, 'static/images')))

app.use('/api/auth', require('./routes/auth.route'))

app.use('/api/user', require('./routes/user.route'))

app.use('/api/posts', require('./routes/posts.route'))

app.use('/api/bookmark', require('./routes/bookmark.route'))

app.use('/api/people', require('./routes/people.route'))


const start = async () => {
   try{
      await mongoose.connect(process.env.URL_MONGO,{
         useNewUrlParser: true,
         useUnifiedTopology: true,
      })

      app.listen(PORT, () => {
         console.log("Server listening on port " + PORT)
      })

      // const db = mongoClient.db("admin");
   }
   catch(err){
      console.error(err)
   }
}

start()
