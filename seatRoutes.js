import express from "express";
import Seat from "../models/seat.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * GET all seats
 */
router.get("/", async(req, res) => {
    const seats = await Seat.find();
    res.json(seats);
});

/**
 * LOCK seats (5 minutes)
 */
router.post("/lock-seats", auth, async(req, res) => {
    const { seats, userId } = req.body;

    const now = new Date();

    // 🔓 1. RELEASE EXPIRED LOCKS
    await Seat.updateMany({
        status: "locked",
        lockExpiresAt: { $lt: now }
    }, {
        $set: {
            status: "available",
            lockedBy: null,
            lockExpiresAt: null
        }
    });

    // ⛔ 2. CHECK IF SEATS ARE AVAILABLE
    const unavailable = await Seat.find({
        seatId: { $in: seats },
        status: { $ne: "available" }
    });

    if (unavailable.length > 0) {
        return res.status(400).json({ message: "Seats not available" });
    }

    // 🔐 3. LOCK SEATS
    const lockTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 min

    await Seat.updateMany({ seatId: { $in: seats } }, {
        $set: {
            status: "locked",
            lockedBy: req.userId,
            lockExpiresAt: lockTime
        }
    });

    res.json({ message: "Seats locked for 5 minutes" });
});


/**
 * CONFIRM BOOKING
 */
router.post("/book", auth, async(req, res) => {
    const { seats } = req.body;

    const valid = await Seat.find({
        seatId: { $in: seats },
        status: "locked",
        lockedBy: req.userId,
        lockExpiresAt: { $gt: new Date() },
    });

    if (valid.length !== seats.length) {
        return res.status(403).json({ message: "Seat lock expired" });
    }

    await Seat.updateMany({ seatId: { $in: seats } }, {
        status: "booked",
        lockedBy: null,
        lockExpiresAt: null,
    });

    res.json({ message: "Booking confirmed 🎉" });
});

/**
 * RESET seats
 */
router.post("/reset", async(req, res) => {
    await Seat.updateMany({}, {
        status: "available",
        lockedBy: null,
        lockExpiresAt: null,
    });

    res.json({ message: "Seats reset" });
});

export default router;