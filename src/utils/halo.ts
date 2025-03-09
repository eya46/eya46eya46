import urlJoin from "url-join";
import type { Content, HaloLinks, HaloPosts } from "./haloType.ts";
import { checkIsNextDay } from "./date.ts";
import { withCache } from "./cache.ts";
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

  @withCache("content", checkIsNextDay)
  @(withCatch<Content>)
  async getContent(name: string): Promise<Content | undefined> {
    const response = await fetch(urlJoin(this.api, `/api.console.halo.run/v1alpha1/posts/${name}/release-content`), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return (await response.json()) as Content;
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
