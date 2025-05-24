
const express = require('express')
const RoomControllers = require('../controllers/roomControllers')
const router = express.Router()

router.post('/', RoomControllers.createRoom)
router.get('/hospital/:hospitalId', RoomControllers.GetRooms)
router.get('/getId/:hospitalId', RoomControllers.getId);
router.get('/roomno/:Id', RoomControllers.getRoomByRoomNo)
router.get('/category/:category/type/:type/:hospitalId', RoomControllers.getRoomNumByCatAndType)
router.get('/:Id', RoomControllers.getRoomsById);
router.patch('/status/:id/:hospitalId', RoomControllers.updateRoomStatus);
router.patch('/vacancy/:Id', RoomControllers.updateRoomVacancy);
router.post('/upload-excel', RoomControllers.addRoomFromExcel);



module.exports = router

