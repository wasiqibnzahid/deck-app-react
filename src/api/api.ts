import axios from "axios";
import { TData } from "../types/types";
export const getRoutes = () => {
  const baseUrl = "http://127.0.0.1:8000";
  return {
    closest: `${baseUrl}/closest-records/`,
    search: `${baseUrl}/search-description`,
    range: `${baseUrl}/within-range`,
  };
};

export const routes = getRoutes();
export async function getClosest(
  lat: number,
  long: number,
  signal: AbortSignal
): Promise<{
  closest: TData[],
  all: TData[]
}> {
  return axios
    .get<{
      closest: TData[],
      all: TData[]
    }>(routes.closest, {
      params: {
        longitude: long,
        latitude: lat,
      },
      signal,
    })
    .then((res) => res.data);
}

export async function searchApi(text: string, signal: AbortSignal) {
  return axios
    .get<TData[]>(routes.search, {
      params: {
        search_text: text,
      },
      signal,
    })
    .then((res) => res.data);
}

export async function getInRage(
  minLat: number,
  maxLat: number,
  minLong: number,
  maxLong: number,
  signal: AbortSignal
) {
  return axios
    .get<TData[]>(routes.range, {
      params: {
        min_longitude: minLong,
        max_longitude: maxLong,
        min_latitude: minLat,
        max_latitude: maxLat,
      },
      signal,
    })
    .then((res) => res.data);
}
