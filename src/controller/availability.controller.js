import Availability from "../models/Availability.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js"

export const getBlockedDates = async (req, res) => {
    try {
        const blocked = await Availability.find({
            business: req.params.businessID,
            date: { $gte: new Date() }
        })

        res.status(200).json(blocked)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getWorkingHours = async (req, res) => {
    try {
        const business = await User.findById(req.params.businessID).select('workingHours bufferTime businessName')
        if (!business) {
            return res.status(404).json({ message: 'Business not found' })
        }

        res.status(200).json(business)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getAvailableSlots = async (req, res) => {
    try {
        const { businessID, date, serviceID } = await req.params
        const business = await User.findById(businessID)
            .select('workingHours bufferTime')

        if (!business) {
            return res.status(404).json({ message: 'Business not found' })
        }

        const service = await Service.findById(serviceID)

        if (!service) {
            return res.status(404).json({ message: 'Service not found' })
        }

        const bookingDate = new Date(date)
        const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

        const daySchedule = business.workingHours.find(d => d.day === dayName)

        if (!daySchedule || !daySchedule.isOpen) {
            return res.json({ slots: [], message: 'Business closed on this day' })
        }

        const isBlocked = await Availability.findOne({
            business: businessID,
            date: {
                $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
                $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
            }
        })

        if (isBlocked) {
            return res.json({ slots: [], message: 'Business unavailable on this date' })
        }

        const existingBookings = await Booking.find({
            business: businessID,
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
            },
            status: { $nin: ['cancelled'] }
        })

        const slots = generateSlots(
            daySchedule.openTime,
            daySchedule.closeTime,
            service.duration,
            business.bufferTime,
            existingBookings
        )

        res.json({ slots })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Block a date
// @route   POST /api/v1/availability
export const blockDate = async (req, res) => {
    try {
        const { date, reason } = req.body

        const alreadyBlocked = await Availability.findOne({
            business: req.user._id,
            date: new Date(date)
        })

        if (alreadyBlocked) {
            return res.status(400).json({ message: 'Date already blocked' })
        }

        const blocked = await Availability.create({
            business: req.user._id,
            date: new Date(date),
            reason
        })

        res.status(201).json(blocked)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Unblock a date
// @route   DELETE /api/v1/availability/:id
export const unblockDate = async (req, res) => {
    try {
        const blocked = await Availability.findById(req.params.id)

        if (!blocked) {
            return res.status(404).json({ message: 'Blocked date not found' })
        }

        if (blocked.business.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        await Availability.findByIdAndDelete(req.params.id)
        res.json({ message: 'Date unblocked' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Update working hours
// @route   PUT /api/v1/availability/hours
export const updateWorkingHours = async (req, res) => {
    try {
        const { workingHours, bufferTime } = req.body

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { workingHours, bufferTime },
            { new: true }
        ).select('workingHours bufferTime')

        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// ── Helper ──────────────────────────────────────────
const generateSlots = (openTime, closeTime, duration, bufferTime, existingBookings) => {
    const slots = []

    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)

    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin
    const slotSize = duration + bufferTime

    for (let time = openMinutes; time + duration <= closeMinutes; time += slotSize) {
        const startHour = Math.floor(time / 60)
        const startMin = time % 60
        const endTime = time + duration
        const endHour = Math.floor(endTime / 60)
        const endMin = endTime % 60

        const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
        const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

        const isBooked = existingBookings.some(
            b => b.startTime === startStr
        )

        slots.push({
            startTime: startStr,
            endTime: endStr,
            isAvailable: !isBooked
        })
    }

    return slots
}