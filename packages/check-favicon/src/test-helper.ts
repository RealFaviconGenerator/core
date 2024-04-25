import { CheckerMessage, FetchResponse, Fetcher } from "./types";
import { parse } from 'node-html-parser'

export const testFetcher = (database: { [url: string]: FetchResponse }): Fetcher => {
  return async (url, contentType) => {
    const res = database[url];
    if (!res) {
      return { status: 404, contentType: contentType || 'application/octet-stream' };
    }
    return res;
  }
}
