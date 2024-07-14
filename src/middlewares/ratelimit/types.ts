export type Options = {
  windowMs: number;

  limit: number;
};

export type ClientRateLimitInfo = {
  hits: number;
  resetTime: Date;
};
