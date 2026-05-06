import express from "express"
import { getBlockedDates, getWorkingHours, getAvailableSlots, blockDate, unblockDate, updateWorkingHours } from "../controller/availability.controller.js"
import protect from "../middlewares/auth.middleware.js"

const router = express()

router.get('/public/:businessID', getBlockedDates)
router.get('/hours/:businessID', getWorkingHours)
router.get('/slots/:businessID/:date/:serviceID', getAvailableSlots)
router.post('/', protect, blockDate)
router.delete('/:id', protect, unblockDate)
router.put('/hours', protect, updateWorkingHours)

export default router
