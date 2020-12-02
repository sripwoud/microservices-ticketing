import request from 'supertest'

import { app } from '../../app'
import { fakeId, createOrder } from '../../lib'
import { OrderStatus } from '@r1ogatix/common'
import { stripe } from '../../lib'

jest.mock('../../lib/stripe')

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({ token: 'asda', orderId: fakeId() })
    .expect(404)
})

it('returns 403 when purchasing an order that does not belong to the authenticated user', async () => {
  const { id } = await createOrder()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({ token: 'asda', orderId: id })
    .expect(403)
})

it('returns 400 when purchasing an already cancelled order', async () => {
  const userId = fakeId()
  await createOrder({
    id: fakeId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled
  })

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .expect(400)
})

it('returns 204 with valid inputs', async () => {
  const userId = fakeId()
  const order = await createOrder({
    id: fakeId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Created
  })

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({ token: 'tok_visa', orderId: order.id })
    .expect(201)

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

  expect(chargeOptions.source).toEqual('tok_visa')
  expect(chargeOptions.currency).toEqual('usd')
  expect(chargeOptions.amount).toEqual(1000)
})
