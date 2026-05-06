import express from "express"
import { login, register, getMe, updateBusiness } from "../controller/auth.controller.js"
import protect from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
router.get("/me", protect, getMe)
router.put("/business", protect, updateBusiness)

export default router