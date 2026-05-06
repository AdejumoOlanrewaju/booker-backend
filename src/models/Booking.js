import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
  business: {type : mongoose.Schema.Types.ObjectId, ref : "User"},     // ref User
  service: {type : mongoose.Schema.Types.ObjectId, ref : "Service"}, // ref Service
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  date: Date,
  startTime: String,      // "10:00"
  endTime: String,        // "10:30"
  status: String,         // pending, confirmed, cancelled, completed
  reference: String,      // unique booking ref e.g. BK-2024-0001
  notes: String,
  reminderSent: Boolean,
  createdAt: Date
})

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking