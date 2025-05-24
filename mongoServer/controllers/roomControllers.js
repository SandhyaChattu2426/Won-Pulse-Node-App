const rooms = require('../models/rooms')
const Room = require('../models/rooms')


const createRoom = (req, res, next) => {
    console.log("room Details")
    try {
        console.log("Triggering body")
        console.log(req.body)
        const room = new Room({
            ...req.body,

        })
        room.save()
    } catch (e) {
        console.log(e)
        console.log("error is triggering")
    }
    res.send("Room registered Successfully")
}

// Get Room Details (All)
const GetRooms = async (req, res, next) => {
    const { hospitalId } = req.params
    let List;
    try {
        List = await Room.find({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// Getting Id
const getId = async (req, res, next) => {
    let newRoomId;
    let RoomsLength;
    const str = "0";

    console.log("Backend triggering to get ID");
    const { hospitalId } = req.params
    try {
        // Fetch all hospitals from the database
        const room = await Room.find({ hospitalId });
        console.log(room, "rooms Here")

        if (room.length > 0) {
            const lastRoom = await Room.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            const lastRoomId = lastRoom[0].roomId;
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'R' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'R' + '0'.repeat(5) + "1";  // HP000001
        }
        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });
    } catch (err) {
        console.log(err)
    }
};

//Getting details By Id

const getRoomsById = async (req, res, next) => {
    const { Id } = req.params
    console.log(Id)
    let Item;
    try {
        Item = await Room.findOne({ "roomId": Id })
        console.log(Item)

    } catch (e) {
        console.log(e)
    }
    res.json(Item)
}


// update Room Status
const updateRoomStatus = async (req, res, next) => {
    try {
        const { id, hospitalId } = req.params
        const room = await rooms.findOne({ roomId: id, hospitalId: hospitalId })
        if (room) {
            try {
                room.status = req.body.status
                await room.save()
                return res.status(200).json({ message: "room status updated successfully!" });

            } catch (e) {
                console.log(e, "error @room ")
                console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

//Get Room By RoomNo
const getRoomByRoomNo = async (req, res, next) => {
    const RoomNo = req.params.Id
    console.log(req.params)
    const room = await Room.findOne({ "RoomDetails.RoomNumber": RoomNo })
    console.log(room, "before-update")
    try {

        res.json({ roomId: room.RoomDetails.RoomId })
    }
    catch (e) {
        console.log(e)
    }

}

//updateRoomVacancy
const updateRoomVacancy = async (req, res, next) => {
    const roomId = req.params.Id
    // console.log(roomId)
    const room = await Room.findOne({ "RoomDetails.RoomId": roomId })
    // console.log(room, "before VacancyUpdate")
    // console.log(req.body)
    try {
        await Room.updateOne(
            { "roomId": roomId },  // Find the room by its RoomId
            { $set: { "vacancy": req.body.vacancy } }  // Only update the vacancy field
        );

        // console.log(room, "after update")
    } catch (e) {
        console.log(e)
    }

}
const getRoomNumByCatAndType = async (req, res, next) => {
    try {
        const { category, type } = req.params;
        const rooms = await Room.find({ category, roomType: type });
        if (!rooms.length) {
            return res.status(404).json({ message: "No rooms found" });
        }
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Server error" });
    }
}


const addRoomFromExcel = async (req, res, next) => {
    try {
        const {
            RoomNumber,
            Category,
            RoomType,
            RoomCharge,
            Status,
            HospitalId,
            CreatedBy,
            hospitalId
        } = req.body;

        // Validate required fields
        if (!RoomNumber || !Category || !RoomType || !RoomCharge || !Status) {
            return res.status(400).json({ message: "Missing required room details." });
        }

        // Generate unique roomId
        const totalRooms = await Room.countDocuments();
        let lastId = 0;

        if (totalRooms > 0) {
            const last = await Room.findOne().sort({ _id: -1 });
            lastId = parseInt(last.roomId.slice(2)) || 0;
        }

        const prefix = "R";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        const roomId = prefix + paddedNumber;

        const newRoom = new Room({
            roomId,
            roomNumber: RoomNumber,
            category: Category,
            roomType: RoomType,
            roomCharge: RoomCharge,
            status: Status,
            hospitalId: hospitalId || "",
            createdBy: CreatedBy || ""
        });

        await newRoom.save();
        res.status(201).json({ room: newRoom });

    } catch (err) {
        console.error("Error creating room from Excel:", err);
        return next(new HttpError(`Saving room failed, please try again. ${err}`, 500));
    }
};

exports.createRoom = createRoom
exports.GetRooms = GetRooms
exports.getId = getId
exports.getRoomsById = getRoomsById
exports.updateRoomStatus = updateRoomStatus
exports.getRoomByRoomNo = getRoomByRoomNo
exports.updateRoomVacancy = updateRoomVacancy
exports.getRoomNumByCatAndType = getRoomNumByCatAndType
exports.addRoomFromExcel = addRoomFromExcel