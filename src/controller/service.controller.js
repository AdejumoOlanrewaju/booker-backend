import Service from "../models/Service.js";

export const getServices = async (req, res) => {
    try {
        const services = await Service.find({
            business: req.user._id,
            isActive: true
        })
        res.status(200).json(services)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }

}

export const getPublicServices = async (req, res) => {
    try {
        const services = await Service.find({
            business: req.params.businessID,
            isActive: true
        })
        
        res.status(200).json(services)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createService = async (req, res) => {
    try {
        const { name, description, duration, price } = req.body

        const service = await Service.create({
            business: req.user._id,
            name,
            description,
            duration,
            price,
            isActive: true
        })

        res.status(201).json(service)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)

        if (!service) {
            return res.status(404).json({ message: 'Service not found' })
        }

        if (service.business.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        const updated = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
        if (!service) {
            return res.status(404).json({ message: "Service not found" })
        }

        if (service.business.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        )

        res.json({ message: "Service deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
