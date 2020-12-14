import * as dotenv from "dotenv";
import * as sgMail from "@sendgrid/mail";
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import * as passport from "passport";
import * as morgan from "morgan";
import * as helmet from "helmet";
import jwtMiddleware from "./middlewares/jwt";
import mainRouter from "./routes";

dotenv.config();

import * as swStats from "swagger-stats";

const PORT = process.env.PORT || 3333;

const app = express();
const connUri = process.env.MONGO_LOCAL_CONN_URL;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(
  swStats.getMiddleware({
    uriPath: "/api/auth/stats",
    authentication: true,
    sessionMaxAge: 1000, // seconds
    onAuthenticate(req, username, password) {
      // simple check for username and password
      return (
        username === process.env.SWAGGER_USERNAME &&
        password === process.env.SWAGGER_PASSWORD
      );
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));
app.use(helmet());

mongoose.connect(connUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () =>
  console.log("MongoDB --  database connection established successfully!")
);
connection.on("error", (err) => {
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running. " + err
  );
  process.exit();
});

app.use(passport.initialize());
jwtMiddleware(passport);

mainRouter(app);

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
