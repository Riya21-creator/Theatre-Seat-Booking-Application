import { useEffect, useState } from "react";
import "./App.css";

const ROWS = 6;
const COLS = 8;
const SEAT_PRICE = 200;
const LOCK_TIME = 300; // 5 minutes

export default function SeatBookingApp() {
  // ✅ 1. ALL STATES FIRST
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // ✅ 2. FETCH SEATS
  useEffect(() => {
  const fetchSeats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/seats");

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setBookedSeats(data.bookedSeats || []);
    } catch (err) {
      alert("Backend not responding");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchSeats();
}, []);


  // ✅ 3. COUNTDOWN TIMER
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ 4. RELEASE SEATS ON TIMEOUT
  useEffect(() => {
  if (timeLeft === 0 && selectedSeats.length > 0) {
    alert("⏰ Time expired! Seats released");
    setSelectedSeats([]);
  }
}, [timeLeft, selectedSeats]);


  // ✅ 5. TOGGLE SEAT
  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      if (prev.length === 0) setTimeLeft(LOCK_TIME);
      return prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId];
    });
  };

  // ✅ 6. BOOK SEATS
  const bookSeats = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const res = await fetch("http://localhost:5000/api/seats/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seats: selectedSeats }),
      });

      if (!res.ok) throw new Error();

      setBookedSeats(prev => [...prev, ...selectedSeats]);
      setSelectedSeats([]);
      setTimeLeft(0);
      alert("✅ Booking Confirmed!");
    } catch {
      alert("❌ Booking failed");
    }
  };

  // ✅ 7. RESET SEATS
  const resetSeats = async () => {
  if (!window.confirm("Reset ALL seats?")) return;

  try {
    const res = await fetch("http://localhost:5000/api/seats/reset", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Reset failed");

    setBookedSeats([]);
    setSelectedSeats([]);
    setTimeLeft(0);
    alert("♻️ Seats reset");
  } catch (err) {
    console.error(err);
    alert("❌ Reset failed");
  }
};

  // ✅ 8. CONDITIONAL RETURN
  if (loading) {
    return <p>Loading seats...</p>;
  }

  // ✅ 9. FINAL JSX
  return (
    <div className="app-container">
      <h1>🎭 Theatre Seat Booking</h1>

      {timeLeft > 0 && (
        <p className="timer">
          ⏳ {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      )}

      <div className="seat-grid">
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={r} className="seat-row">
            {Array.from({ length: COLS }).map((_, c) => {
              const seatId = `${r}-${c}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              let seatClass = "seat available";
              if (isBooked) seatClass = "seat booked";
              else if (isSelected) seatClass = "seat selected";

              return (
                <button
                  key={seatId}
                  className={seatClass}
                  disabled={isBooked}
                  onClick={() => toggleSeat(seatId)}
                >
                  {c + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p><b>Selected:</b> {selectedSeats.join(", ") || "None"}</p>
      <p><b>Total:</b> ₹{selectedSeats.length * SEAT_PRICE}</p>

      <button onClick={bookSeats}>Confirm Booking</button>
      <button onClick={resetSeats}>Reset Seats</button>
    </div>
  );
}
