import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/database.js"
import authRoutes from "./routes/auth.routes.js"
import serviceRoutes from "./routes/services.routes.js"
import availabiityRoutes from "./routes/availability.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/services", serviceRoutes)
app.use('/api/v1/availability', availabiityRoutes)
app.use("/api/v1/bookings", bookingRoutes)

const port = 5500

app.listen(port, () => {
    connectDB()
    console.log("Backend listening at port: ", port)
})