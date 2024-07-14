import { Request, Response, NextFunction, RequestHandler } from "express";
import { isIP } from "node:net";
import { Options } from "./types";
import Store from "./store";

export type Configuration = {
  windowMs: number;
  limit: number;
  store: Store;
};

const parseOptions = (passedOptions: Options): Configuration => {
  const config: Configuration = {
    windowMs: passedOptions.windowMs ?? 60 * 1000,
    limit: passedOptions.limit ?? 10,
    store: new Store(),
  };
  return config;
};

const getResetSeconds = (resetTime: Date): number | undefined => {
  let resetSeconds: number | undefined = undefined;
  const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
  resetSeconds = Math.max(0, deltaSeconds);
  return resetSeconds;
};

const setRetryAfterHeader = (response: Response, resetTime: Date): void => {
  if (response.headersSent) return;

  const resetSeconds = getResetSeconds(resetTime);
  response.setHeader("Retry-After", resetSeconds!.toString());
};

// ratelimit middleware function:
const rateLimit = (passedOptions: Options): RequestHandler => {
  const config = parseOptions(passedOptions);
  config.store.init(config);
  const middleware = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    let ip = request.ip;
    if (ip === undefined || !isIP(ip)) throw new Error("invalid ip address");
    else if (request.app.get("trust proxy") === true)
      throw new Error(
        "trust proxy is set to true, which allow anyone to bypass the rate limit",
      );

    const key = ip;
    const { hits, resetTime } = await config.store.increase(key);

    if (hits > config.limit) {
      setRetryAfterHeader(response, resetTime);
      response.status(429).send("Too Many Request");

      return;
    }
    next();
  };
  return middleware as RequestHandler;
};

export default rateLimit;
