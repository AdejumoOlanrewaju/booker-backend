import mongoose from "mongoose"
const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected : ${connectionInstance.connection.host}`)
    }catch(err){
        console.error("Error in MongoDB connnection: ", err)
    }
}

export default connectDB