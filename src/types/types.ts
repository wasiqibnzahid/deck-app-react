export interface TData {
  HId: number;
  IId: number;
  HPId: string;
  C0: number;
  C1: number;
  C2: number;
  SLat: number;
  SLong: number;
  SPId: string;
  D2Sm: number;
  HIdDensity: number;
  Title: string;
  Description: string;
  Image: string;
  weeknumber: number;
  weekly_sales: number;
  distance: number;
  selected: boolean;
  color: any;
  avg_weekly_sales: number;
  forecast_records?: SalesData[];
}

export interface SalesData {
  date: string; // The date in string format
  forecast: number; // The forecast value
  weekly_sales: number; // The weekly sales value
}
