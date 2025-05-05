const express=require('express')
const userControllers=require('../controllers/userControllers')
const router = express.Router()
const { check } = require('express-validator')

router.get('/:email',userControllers.getUserByEmail)
router.patch('/update/:email',userControllers.updateMfa)// to update mfa types
router.patch('/updatepassword/:email',userControllers.updatePassword)
router.get("/", userControllers.getLogin)

router.get("/:sid", userControllers.getLoginById)

router.post("/", userControllers.putId);

router.patch('/:aid', [
    check('user_id').not().isEmpty(),
    check('user_status').not().isEmpty(),
    check('user_type').not().isEmpty(),
], userControllers.createLogin)

router.patch('/update/:sid', userControllers.updateLogin)

router.put('/updatelayout/:sid', userControllers.updateLayout)

router.patch('/updatepassword/:sid', userControllers.updatePassword)
router.get('/get/:sid', userControllers.searchLogin)
router.patch('/profile/:email', userControllers.updateProfile)
router.delete('/:sid', userControllers.deleteLogin)
module.exports = router