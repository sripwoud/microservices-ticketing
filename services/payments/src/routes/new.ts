import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  OrderStatus
} from '@r1ogatix/common'
import { Order } from '../models'

const router = Router()

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty().withMessage('Token must be provided'),
    body('orderId').notEmpty().withMessage('orderId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      currentUser,
      body: { token, orderId }
    } = req
    const order = await Order.findById(orderId)

    if (!order) throw new NotFoundError()
    if (order.userId !== currentUser!.id)
      throw new ForbiddenError(
        'Not authorized to pay for an order/ticket you do not own'
      )
    if (order.status == OrderStatus.Cancelled)
      throw new BadRequestError('Cannot pay for a cancelled order')

    res.send({ success: true })
  }
)

export { router as createChargeRouter }
