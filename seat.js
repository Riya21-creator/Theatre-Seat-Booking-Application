import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    seatId: { type: String, required: true, unique: true },
    isBooked: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["available", "locked", "booked"],
        default: "available"
    },

    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lockExpiresAt: { type: Date, default: null },
});

export default mongoose.model("Seat", seatSchema);