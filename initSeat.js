import Seat from "../models/seat.js";

const ROWS = 6;
const COLS = 8;

const initSeats = async() => {
    const count = await Seat.countDocuments();
    if (count > 0) return;

    const seats = [];

    for (let r = 0; r < ROWS; r++) {
        const rowLabel = String.fromCharCode(65 + r); // A-F

        for (let c = 0; c < COLS; c++) {
            seats.push({
                seatId: `${rowLabel}${c + 1}`, // ✅ A1, A2...
                row: rowLabel,
                col: c + 1,
                isBooked: false,
            });
        }
    }

    await Seat.insertMany(seats);
    console.log("🪑 Seats initialized in DB");
};

export default initSeats;