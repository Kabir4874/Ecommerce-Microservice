import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import proxy from "express-http-proxy";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import morgan from "morgan";
import * as path from "path";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// !apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.users ? 1000 : 100),
  message: { error: "Too many requests, please try again later!" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req) => {
    const ip = req.ip || "unknown-ip";
    return ipKeyGenerator(ip);
  },
});

app.use(limiter);

app.use("/", proxy("http://localhost:6001"));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
