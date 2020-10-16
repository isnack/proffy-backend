import express from 'express'
import routes from './routes';
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cors())
app.use(routes)

app.listen(process.env.PORT || 3333)