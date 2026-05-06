import mongoose from "mongoose"

const serviceSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  description: String,
  duration: Number,
  price: Number,
  isActive: Boolean,
  createdAt: Date
})

const Service = mongoose.model("Service", serviceSchema)
export default Service