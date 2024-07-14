import type { Options, ClientRateLimitInfo } from "./types";

export default class Store {
  windowsMs!: number;

  clientsInfo = new Map<string, ClientRateLimitInfo>();

  init = (options: Options) => {
    this.windowsMs = options.windowMs;
    this.clientsInfo.clear();
  };

  private getClientInfo(key: string): ClientRateLimitInfo {
    if (this.clientsInfo.has(key)) return this.clientsInfo.get(key)!;
    let clientInfo = { hits: 0, resetTime: new Date() };
    this.resetClientInfo(clientInfo);
    this.clientsInfo.set(key, clientInfo);
    return clientInfo;
  }

  private resetClientInfo(
    clientInfo: ClientRateLimitInfo,
  ): ClientRateLimitInfo {
    clientInfo.hits = 0;
    clientInfo.resetTime.setTime(Date.now() + this.windowsMs);
    return clientInfo;
  }

  async increase(key: string): Promise<ClientRateLimitInfo> {
    const clientInfo = this.getClientInfo(key);
    const now = Date.now();
    if (clientInfo.resetTime.getTime() <= now) {
      this.resetClientInfo(clientInfo);
    }
    clientInfo.hits++;
    return clientInfo;
  }

  async decrease(key: string): Promise<void> {
    const clientInfo = this.getClientInfo(key);
    if (clientInfo.hits > 0) clientInfo.hits--;
  }
}
