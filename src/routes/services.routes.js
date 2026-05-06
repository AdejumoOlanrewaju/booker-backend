import express from "express"
import { getServices, getPublicServices, createService, updateService, deleteService } from "../controller/service.controller.js"
import protect from "../middlewares/auth.middleware.js"

const router = express.Router();

router.get("/public/:businessID", getPublicServices)
router.get("/", protect, getServices)
router.post("/", protect, createService)
router.put("/:id", protect, updateService)
router.delete("/:id", protect, deleteService)

export default router