const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    seats: [String],
    totalPrice: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);