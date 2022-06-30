require('dotenv').config()
const { google } = require('googleapis');
const path = require('path');
var multer = require('multer')
var GoogleDriveStorage = require('multer-google-drive')
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')

const KEYFILE = {
  private_key: GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
}


const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
   credentials: KEYFILE,
   scopes: SCOPES
})


var drive = google.drive({version: 'v3', auth: auth})
const types = ['image/png', 'image/jpeg', 'image/jpg']

const upload = multer({
   storage: GoogleDriveStorage({
      drive: drive,
      parents: '17ylOS8Q7tH8TLi65QNvYdDQK0HmqOIAT',
      fileName: function (req, file, cb) {
         if(types.includes(file.mimetype)){
            cb(null, true)
         }
         else {
            cb(null, false)
         }
      }
   })
})

module.exports = upload

