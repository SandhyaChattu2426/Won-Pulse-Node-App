
const express=require('express')
const DashboardControllers=require('../controllers/dashboard-controllers')
const router = express.Router()

router.get('/',DashboardControllers.GetDashboardData)
// router.get('/',RoomControllers.GetRooms)
// router.get('/getId',RoomControllers.getId);
// router.get('/roomno/:Id',RoomControllers.getRoomByRoomNo)
// router.get('/category/:category/type/:type',RoomControllers.getRoomNumByCatAndType)
// router.get('/:Id', RoomControllers.getRoomsById);
// router.patch('/status/:Id',RoomControllers.updateRoomStatus);
// router.patch('/vacancy/:Id',RoomControllers.updateRoomVacancy);


module.exports = router

