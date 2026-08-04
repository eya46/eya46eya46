import urlJoin from "url-join";
import type { Content, HaloLinks, HaloPosts } from "../types/halo.ts";
import { checkIsNextDay } from "./date.ts";
import { fetchWithTimeout, warmCache, withCache } from "./cache.ts";
import { withCatch } from "./funcTool.ts";
import { HALO_TOKEN, HALO_URL } from "astro:env/server";

class Halo {
  private readonly token: string;
  public url: string;
  public api: string;

  constructor(token: string, url: string) {
    this.token = token;
    this.url = url;
    this.api = urlJoin(url, "/apis");
  }

  private authHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  @withCache("posts", checkIsNextDay)
  @withCatch
  async getPosts(): Promise<HaloPosts | undefined> {
    const response = await fetchWithTimeout(urlJoin(this.api, "/api.console.halo.run/v1alpha1/posts"), {
      headers: this.authHeaders(),
    });
    if (!response.ok) throw new Error(`Halo posts: ${response.status}`);
    return (await response.json()) as HaloPosts;
  }

  @withCache("content", checkIsNextDay)
  @(withCatch<Content>)
  async getContent(name: string): Promise<Content | undefined> {
    const response = await fetchWithTimeout(
      urlJoin(this.api, `/api.console.halo.run/v1alpha1/posts/${name}/release-content`),
      { headers: this.authHeaders() }
    );
    if (!response.ok) throw new Error(`Halo content ${name}: ${response.status}`);
    return (await response.json()) as Content;
  }

  @withCache("links", checkIsNextDay)
  @withCatch
  async getLinks(): Promise<HaloLinks | undefined> {
    const response = await fetchWithTimeout(
      urlJoin(this.api, "/api.plugin.halo.run/v1alpha1/plugins/PluginLinks/links"),
      { headers: this.authHeaders() }
    );
    if (!response.ok) throw new Error(`Halo links: ${response.status}`);
    return (await response.json()) as HaloLinks;
  }
}

export const halo = new Halo(HALO_TOKEN as string, HALO_URL as string);

if (HALO_TOKEN && HALO_URL) {
  warmCache("posts", () => halo.getPosts());
  warmCache("links", () => halo.getLinks());
}
