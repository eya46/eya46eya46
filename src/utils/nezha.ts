import { NEZHA_HOST } from "astro:env/server";
import type { NezhaRawData, NezhaData } from "../types/nezha";
import { processRawData } from "./nezha-process";

export type { ProcessedServer, NezhaData } from "../types/nezha";

class NezhaStatus {
  private ws: WebSocket | null = null;
  private data: NezhaData | null = null;
  private retryCount = 0;
  private maxRetry = 30;
  private retryInterval = 3000;
  private url: string;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    const doConnect = () => {
      try {
        this.ws = new WebSocket(this.url);
      } catch (e) {
        console.error("[nezha] WebSocket construction failed:", e);
        this.scheduleRetry(doConnect);
        return;
      }

      this.ws.onopen = () => {
        this.retryCount = 0;
        console.log("[nezha] WebSocket connected");
      };

      this.ws.onmessage = (ev: MessageEvent) => {
        try {
          const raw = JSON.parse(typeof ev.data === "string" ? ev.data : String(ev.data)) as NezhaRawData;
          this.data = processRawData(raw);
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        console.log("[nezha] WebSocket closed");
        this.scheduleRetry(doConnect);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    };

    doConnect();
  }

  private scheduleRetry(fn: () => void) {
    if (this.retryCount < this.maxRetry) {
      this.retryCount++;
      console.log(`[nezha] Reconnecting (${this.retryCount}/${this.maxRetry})...`);
      setTimeout(fn, this.retryInterval);
    }
  }

  getData(): NezhaData | null {
    return this.data;
  }
}

export const nezha = new NezhaStatus(`ws://${NEZHA_HOST}/api/v1/ws/server`);
