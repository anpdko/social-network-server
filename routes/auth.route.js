require('dotenv').config()
const {Router} = require('express')
const router = Router()
const User = require('../models/User')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwtToken = require('jsonwebtoken')

//Второй параметр middelware, неограниченое количество функций в массиве
router.post('/registration', 
   [
      check('email', {email: 'Некорректный email'}).isEmail(),
      check('password', {password:'Некоррекстный пароль'}).isLength({min: 6})
   ], 
   async (req, res) => {
      try{
         const {email, name, password} = req.body

         //работа с валидацией данных
         const errors = validationResult(req)
         if(!errors.isEmpty()){
            return res.status(400).json({
               errors: errors.array(),
               message: {email: 'Некорректные данные при регистрации'}
            })
         }

         //проверка на повторяющийся email
         const isUsed = await User.findOne({email})
         if(isUsed){
            return res.status(300).json({message: {email: "Данный Email уже занят, попробуйте другой."}})
         }

         const hashedPassword = await bcrypt.hash(password, 12)
         
         //создание пользователя
         const user = new User({
            email, name, password: hashedPassword
         })
         await user.save()

         res.status(201).json({message: 'Пользователь создан'})
      }
      catch(error){
         console.error(error)
      }
   }
)

//Второй параметр middelware, неограниченое количество функций в массиве
router.post('/login', 
   [
      check('email', 'Некорректный email').isEmail(),
      check('password', 'Некоррекстный пароль').exists()
   ], 
   async (req, res) => {
      try{
         const {email, password} = req.body

         //работа с валидацией данных
         const errors = validationResult(req)
         if(!errors.isEmpty()){
            return res.status(400).json({
               errors: errors.array(),
               message: {
                  email: 'Некорректные данные при регистрации' 
               }
            })
         }

         const user = await User.findOne({email})
         if(!user){
            return res.status(400).json({message: {
               email: 'Такого Email нет в базе!'
            }})
         }

         const isMatch = await bcrypt.compare(password, user.password)
         if(!isMatch){
            return res.status(400).json({message: {
               password: 'Не верный пароль!'
            }})
         }

         const jwtSecret = process.env.JWT_SECRET
         const token = jwtToken.sign(
            {userId: user.id},
            jwtSecret,
            {expiresIn: '1h'}
         )

         res.json({token, name: user.name, userId: user.id, imgUrlAvatar: user.imgUrlAvatar})

      }
      catch(error){
         console.error(error)
      }
   }
)

module.exports = router