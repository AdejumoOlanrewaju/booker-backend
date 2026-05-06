import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import User from '../models/User.js'
import generateReference from '../util/generateReference.js'
import { sendBookingConfirmation, sendBookingNotificationToAdmin, sendCancellationEmail } from '../util/sendEmail.js'
// @desc    Create a booking (public)
// @route   POST /api/v1/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      businessId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime
    } = req.body

    const business = await User.findById(businessId)
    if (!business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    // calculate end time from start time + service duration
    const [hour, min] = startTime.split(':').map(Number)
    const totalMinutes = hour * 60 + min + service.duration
    const endHour = Math.floor(totalMinutes / 60)
    const endMin = totalMinutes % 60
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

    // check slot is not already taken
    const slotTaken = await Booking.findOne({
      business: businessId,
      date: new Date(date),
      startTime,
      status: { $nin: ['cancelled'] }
    })

    if (slotTaken) {
      return res.status(400).json({ message: 'This slot is no longer available' })
    }

    const booking = await Booking.create({
      business: businessId,
      service: serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date: new Date(date),
      startTime,
      endTime,
      status: 'pending',
      reference: generateReference(),
      reminderSent: false
    })

    await booking.populate('service', 'name duration price')

    Promise.all([
      sendBookingConfirmation({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        businessName: business.businessName,
        serviceName: service.name,
        date: booking.date,
        startTime: booking.startTime,
        reference: booking.reference,
      }),
      sendBookingNotificationToAdmin({
        adminEmail: business.email,
        businessName: business.businessName,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceName: service.name,
        date: booking.date,
        startTime: booking.startTime,
        reference: booking.reference,
      })
    ]).catch(err => console.error('Email error:', err))

    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all bookings for a business (admin)
// @route   GET /api/v1/bookings
export const getBookings = async (req, res) => {
  try {
    const { status, date } = req.query

    let filter = { business: req.user._id }

    if (status) filter.status = status

    if (date) {
      filter.date = {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'name duration price')
      .sort({ date: 1, startTime: 1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name duration price')

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.business.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update booking status (admin)
// @route   PUT /api/v1/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.business.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    booking.status = status
    await booking.save()

    if (status === 'cancelled') {
      await booking.populate('service business', 'name email businessName')

      sendCancellationEmail({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        businessName: booking.business?.businessName,
        serviceName: booking.service?.name,
        date: booking.date,
        startTime: booking.startTime,
        reference: booking.reference,
      }).catch(err => console.error('Email error:', err))
    }

    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Cancel booking (public - customer cancels via reference)
// @route   PUT /api/v1/bookings/cancel/:reference
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      reference: req.params.reference
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' })
    }

    booking.status = 'cancelled'
    await booking.save()

    res.json({ message: 'Booking cancelled successfully', booking })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard analytics
// @route   GET /api/v1/bookings/analytics
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const allBookings = await Booking.find({
      business: req.user._id,
      date: { $gte: startOfMonth }
    }).populate('service', 'name price')

    const total = allBookings.length
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length
    const cancelled = allBookings.filter(b => b.status === 'cancelled').length
    const pending = allBookings.filter(b => b.status === 'pending').length

    const revenue = allBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0)

    const serviceCounts = {}
    allBookings.forEach(b => {
      const name = b.service?.name || 'Unknown'
      serviceCounts[name] = (serviceCounts[name] || 0) + 1
    })

    const mostBooked = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    res.json({
      total,
      confirmed,
      cancelled,
      pending,
      revenue,
      mostBooked,
      cancellationRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}