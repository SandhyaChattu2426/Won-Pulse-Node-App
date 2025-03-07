const express=require('express')
const userControllers=require('../controllers/userControllers')
const router = express.Router()

router.get('/:email',userControllers.getUserByEmail)
router.patch('/update/:email',userControllers.updateMfa)// to update mfa types
router.patch('/updatepassword/:email',userControllers.updatePassword)
module.exports = router