import express, { Request, Response } from "express";

const app = express();

import uploadRoute from "./routes/upload";
app.use(express.json());
app.use("/", uploadRoute);

app.get("/", (request: Request, response: Response) => {
  response.json({ success: true });
});

export default app;
