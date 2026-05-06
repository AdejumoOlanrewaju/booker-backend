import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    businessName: String,
    email: String,
    password: String,
    phone: String,
    address: String,
    description: String,
    logo: String,
    workingHours: [
        {
            day: String,        // monday, tuesday etc
            isOpen: Boolean,
            openTime: String,   // "09:00"
            closeTime: String,  // "17:00"
        }
    ],
    bufferTime: Number,     // minutes between appointments
    createdAt: Date
})

const User = mongoose.model("User", userSchema)
export default User