import Seat from "../models/seat.js";

export const getSeats = async(req, res) => {
    const seats = await Seat.find();
    res.json(seats);
};

export const lockSeats = async(req, res) => {
    const { seats, userId } = req.body;

    const now = new Date();

    const conflict = await Seat.find({
        seatId: { $in: seats },
        $or: [
            { isBooked: true },
            { lockExpiresAt: { $gt: now } },
        ],
    });

    if (conflict.length > 0) {
        return res.status(409).json({ message: "Seats already locked/booked" });
    }

    await Seat.updateMany({ seatId: { $in: seats } }, {
        lockedBy: userId,
        lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min lock
    });

    res.json({ message: "Seats locked for 5 minutes" });
};

export const confirmBooking = async(req, res) => {
    const { seats, userId } = req.body;

    await Seat.updateMany({ seatId: { $in: seats }, lockedBy: userId }, {
        isBooked: true,
        lockedBy: null,
        lockExpiresAt: null,
    });

    res.json({ message: "Booking confirmed" });
};

export const resetSeats = async(req, res) => {
    await Seat.updateMany({}, {
        isBooked: false,
        lockedBy: null,
        lockExpiresAt: null,
    });

    res.json({ message: "All seats reset" });
};