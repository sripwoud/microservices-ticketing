export const natsWrapper = {
  client: {
    publish(subject: string, data: string, cb: () => {}) {
      cb()
    }
  }
}
