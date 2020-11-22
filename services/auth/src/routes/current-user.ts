import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.get('/api/users/currentuser', (req, res) => {
  if (!req.session?.jwt) return res.send({ currentUser: null })
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!)
    res.send({ currentUser: payload })
  } catch (err) {
    res.send({ currentUser: null })
  }
})

router.post('/api/users/currentuser', (_, res) =>
  res.status(200).send('Hello world post')
)

export { router as currentUserRouter }
