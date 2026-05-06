import express from 'express'
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getAnalytics
} from '../controller/booking.controller.js'
import protect from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', createBooking)
router.get('/', protect, getBookings)
router.get('/analytics', protect, getAnalytics)
router.get('/:id', protect, getBooking)
router.put('/:id/status', protect, updateBookingStatus)
router.put('/cancel/:reference', cancelBooking)

export default router