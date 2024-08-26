import React, { useMemo } from "react";
import { SalesData } from "../types/types";
import { ApexOptions } from "apexcharts";
import ApexCharts from "react-apexcharts";

interface Props {
  data?: SalesData[];
}
export const Chart: React.FC<Props> = ({ data = [] }) => {
  const dataToUse = useMemo(() => {
    const filtered = data.filter(
      (item, index) =>
        data.findIndex((innerItem) => innerItem.date === item.date) === index
    );
    const series: ApexAxisChartSeries = [];
    series.push({
      data: filtered.map((item) => ({
        x: item.date,
        y: item.forecast,
      })),
      name: "Forecast",
    });
    series.push({
      data: filtered.map((item) => ({
        x: item.date,
        y: item.weekly_sales,
      })),
      name: "Weekly Sales",
    });
    return series;
  }, [data]);
  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
    },
    series: dataToUse,
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#FFFFFF", // White color for x-axis labels
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#FFFFFF", // White color for y-axis labels
        },
      },
    },
    title: {
      text: "Forecast and Weekly Sales",
      style: {
        color: "#FFFFFF", // White color for the chart title
      },
    },
    tooltip: {
      //   color: "#FFFFFF", // White color for tooltip text
      cssClass: "text-black",
    },
    legend: {
      labels: {
        colors: "#FFFFFF", // White color for legend labels
      },
    },
    dataLabels: {
      style: {
        colors: ["#FFFFFF"], // White color for data labels
      },
    },
    colors: ["#FF4560", "#00E396"], // Colors for lines
  };

  return (
    <ApexCharts
      type="line"
      options={options}
      height={450}
      series={options.series}
    ></ApexCharts>
  );
};

export default Chart;
