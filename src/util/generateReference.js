const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `BK-${timestamp}-${random}`
}

export default generateReference