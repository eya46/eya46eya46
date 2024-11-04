import urlJoin from "url-join";
import type { HaloLinks, HaloPosts } from "./haloType.ts";
import { checkIsNextDay } from "./date.ts";
import { withCache } from "./cache.ts";
import { withCatch } from "./funcTool.ts";

const HALO_URL: string | undefined = import.meta.env.HALO_URL;
const HALO_TOKEN: string | undefined = import.meta.env.HALO_TOKEN;

if (!HALO_URL) throw new Error("HALO_URL is not defined");
if (!HALO_TOKEN) throw new Error("HALO_TOKEN is not defined");

class Halo {
  private readonly token: string;
  public url: string;
  public api: string;

  constructor(token: string, url: string) {
    this.token = token;
    this.url = url;
    this.api = urlJoin(url, "/apis");
  }

  @withCache("posts", checkIsNextDay)
  @withCatch
  async getPosts(): Promise<HaloPosts | undefined> {
    const response = await fetch(urlJoin(this.api, "/api.console.halo.run/v1alpha1/posts"), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return (await response.json()) as HaloPosts;
  }

  @withCache("links", checkIsNextDay)
  @withCatch
  async getLinks(): Promise<HaloLinks | undefined> {
    const response = await fetch(urlJoin(this.api, "/api.plugin.halo.run/v1alpha1/plugins/PluginLinks/links"), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return (await response.json()) as HaloLinks;
  }
}

export const halo = new Halo(HALO_TOKEN as string, HALO_URL as string);
