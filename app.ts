import express, { Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/User'

const app = express()
const PORT = 4000
const SECRET_KEY = 'b0642d70b8b9e5b547d6f01eb2bedda65672fea8f0ec527ce88164e49ab628c5'

app.use(bodyParser.json())
app.use(cors())

mongoose.connect('mongodb://127.0.0.1:27017/build-store')

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("Connected to MongoDB")
})

app.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hashedPassword })
    await user.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ email }, SECRET_KEY)
    res.json({ token })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`)
})
