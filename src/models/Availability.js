import mongoose from "mongoose"

const availabiitySchema = new mongoose.Schema({
    business: {type : mongoose.Schema.Types.ObjectId, ref : "User"},
    date: Date,
    reason: String,         // holiday, fully booked etc
    createdAt: Date
})

const Availability = mongoose.model("Availability", availabiitySchema)
export default Availability