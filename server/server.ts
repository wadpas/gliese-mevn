import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { StreamChat } from 'stream-chat'

dotenv.config()

const app = express()

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const chatClient = StreamChat.getInstance(process.env.STREAM_API_KEY!, process.env.STREAM_API_SECRET!)

// routes
app.post('/register-user', async (req: Request, res: Response): Promise<any> => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  try {
    const userId = email.replace(/[^a-zA-Z0-9_-]/g, '_')

    const userResponse = await chatClient.queryUsers({ id: { $eq: userId } })

    if (userResponse.users.length === 0) {
      await chatClient.upsertUser({
        id: userId,
        name,
        email,
        role: 'user',
      })
    }

    res.status(200).json({ user: { id: userId, name, email } })
  } catch (error) {
    res.status(500).json({ error })
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
