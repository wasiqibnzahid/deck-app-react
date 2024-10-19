import axios from "axios";
import { TData } from "../types/types";
export const getRoutes = () => {
  const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL;
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
  dateVal: { start: string; end: string },
  isFirst: boolean,
  signal: AbortSignal
): Promise<{
  closest: TData[];
  all: TData[];
}> {
  return axios
    .get<{
      closest: TData[];
      all: TData[];
    }>(routes.closest, {
      params: {
        longitude: long,
        latitude: lat,
        isFirst: isFirst.toString(),
        ...dateVal,
      },
      signal,
    })
    .then((res) => res.data);
}

export async function searchApi(
  text: string,
  mode: "bigquery" | "model" | "id",
  coordinates: { lat: number; long: number },
  dateVal: { start: string; end: string },
  signal: AbortSignal
) {
  return axios
    .get<TData[]>(routes.search, {
      params: {
        search_text: text,
        mode: mode,
        latitude: coordinates.lat,
        longitude: coordinates.long,
        ...dateVal,
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
