import urlJoin from "url-join";
import type { HaloLinks, HaloPosts } from "./halo_type.ts";
import { checkIsNextDay } from "./date.ts";
import { setCache, getCache } from "./cache.ts";

const HALO_URL: string | undefined = import.meta.env.HALO_URL;
const HALO_TOKEN: string | undefined = import.meta.env.HALO_TOKEN;

if (!HALO_URL) throw new Error("HALO_URL is not defined");
if (!HALO_TOKEN) throw new Error("HALO_TOKEN is not defined");

export const HALO_API = urlJoin(HALO_URL, "/apis");

export const API_POST = urlJoin(HALO_API, "api.console.halo.run/v1alpha1/posts");

async function _getPosts(): Promise<HaloPosts | undefined> {
  console.log("fetching posts", new Date());
  try {
    const response = await fetch(API_POST, {
      headers: {
        Authorization: `Bearer ${HALO_TOKEN}`,
      },
    });
    const data = (await response.json()) as HaloPosts;
    setCache("posts", data);
    return data;
  } catch (e) {
    console.error("error fetching posts", new Date());
    console.error(e);
    return undefined;
  }
}

export async function getPosts(): Promise<HaloPosts | undefined> {
  const [time, data] = getCache("posts");
  if (time && data) {
    if (checkIsNextDay(time)) _getPosts().then();
    return data as HaloPosts;
  }
  return await _getPosts();
}

async function _getLinks(): Promise<HaloLinks | undefined> {
  console.log("fetching links", new Date());
  try {
    const response = await fetch(urlJoin(HALO_API, "/api.plugin.halo.run/v1alpha1/plugins/PluginLinks/links"), {
      headers: {
        Authorization: `Bearer ${HALO_TOKEN}`,
      },
    });
    const data = (await response.json()) as HaloLinks;
    setCache("links", data);
    return data;
  } catch (e) {
    console.error("error fetching links", new Date());
    console.error(e);
    return undefined;
  }
}

export async function getLinks(): Promise<HaloLinks | undefined> {
  const [time, data] = getCache("links");
  if (time && data) {
    if (checkIsNextDay(time)) _getLinks().then();
    return data as HaloLinks;
  }
  return await _getLinks();
}
