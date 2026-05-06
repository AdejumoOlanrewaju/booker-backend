import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { sendBookingConfirmation, sendBookingNotificationToAdmin, sendCancellationEmail } from "../util/sendEmail.js"
const protect = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message : "Not Authorized, no token"})
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select("-password")
        next()
    }catch(err){
        res.status(500).json({ message : "Not authorized, token failed" })
    }
} 

export default protect