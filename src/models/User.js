import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    businessName: String,
    email: String,
    password: String,
    phone: String,
    address: String,
    description: String,
    logo: String,
    workingHours: {
        type: [
            {
                day: String,
                isOpen: Boolean,
                openTime: String,
                closeTime: String,
            }
        ],
        default: [
            { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '14:00' },
            { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '14:00' },
        ]
    },
    bufferTime: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model("User", userSchema)
export default User