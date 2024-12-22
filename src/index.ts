import { Hono, Env } from 'hono'
import { showRoutes } from 'hono/dev'
import apiV1 from '~/routes/v1'
import webhook from '~/webhook/endpoint'

const app = new Hono<Env>()

app.route('/api/v1', apiV1)
app.route('/webhook', webhook)

showRoutes(app)

export default app
