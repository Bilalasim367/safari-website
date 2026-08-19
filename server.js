const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
// cPanel Passenger requires no hardcoded hostname
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

app.prepare().then(() => {
    createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error handling URL:', req.url, err)
            res.statusCode = 500
            res.end('Internal Server Error')
        }
    })
    .listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on port ${port}`)
    })
}).catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
})