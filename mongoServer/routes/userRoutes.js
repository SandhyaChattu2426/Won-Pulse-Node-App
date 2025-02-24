const express=require('express')
const userControllers=require('../controllers/userControllers')
const router = express.Router()

router.patch('/updatepassword/:email',userControllers.updatePassword)
module.exports = router