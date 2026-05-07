import User from "../models/User.js";
import bcrypt from "bcryptjs"
import generateToken from "../util/generateToken.js";

export const register = async (req, res) => {
    try {
        const { businessName, email, password, phone } = req.body

        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400).json({ message: "Email already registered" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            businessName,
            email,
            password: hashedPassword,
            phone,
            workingHours: [
                { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
            ],
            bufferTime: 10
        })

        res.status(201).json({
            _id: user._id,
            businessName: user.businessName,
            email: user.email,
            token: generateToken(user._id)
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" })
        }

        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" })
        }

        res.status(200).json({
            _id: user._id,
            businessName: user.businessName,
            email: user.email,
            token: generateToken(user._id)
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    }catch(err){
        res.status(500).json({message : err.message})
    }
}

export const updateBusiness = async (req, res) => {
  try {
    const { businessName, email, phone, address, description } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { businessName, email, phone, address, description },
      { new: true }
    ).select('-password')

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}