import React, { useMemo, useState } from "react";
import { SalesData } from "../types/types";
import { ApexOptions } from "apexcharts";
import ApexCharts from "react-apexcharts";
import { Button } from "@chakra-ui/react";
import dayjs from "dayjs";

interface Props {
  data?: SalesData[];
}
export const Chart: React.FC<Props> = ({ data = [] }) => {
  const [start, setStart] = useState(dayjs().subtract(1, "year").unix() * 1000);
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
      toolbar: {
        show: false,
      },
    },

    series: dataToUse,

    xaxis: {
      type: "datetime",
      min: start || undefined,
      max: new Date().getTime(),
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

  function setMinVal(val: "1year" | "3months" | "1month" | "1week") {
    let date = dayjs();

    if (val === "1year") {
      date = date.subtract(1, "year");
    } else if (val === "1month") {
      date = date.subtract(1, "month");
    } else if (val === "1week") {
      date = date.subtract(1, "week");
    } else if (val === "3months") {
      date = date.subtract(3, "month");
    }
    setStart(date.unix() * 1000);
  }

  return (
    <div>
      <div className="flex gap-2 justify-end items-center my-2">
        <Button
          colorScheme="gray"
          onClick={() => setMinVal("1year")}
          size="sm"
          className="bg-[#101216] text-sm text-white whitespace-nowrap"
        >
          1 year
        </Button>
        <Button
          colorScheme="gray"
          onClick={() => setMinVal("3months")}
          size="sm"
          className="bg-[#101216] text-sm text-white whitespace-nowrap"
        >
          3 Months
        </Button>
        <Button
          colorScheme="gray"
          onClick={() => setMinVal("1month")}
          size="sm"
          className="bg-[#101216] text-sm text-white whitespace-nowrap"
        >
          1 month
        </Button>
        <Button
          colorScheme="gray"
          onClick={() => setMinVal("1week")}
          size="sm"
          className="bg-[#101216] text-sm text-white whitespace-nowrap"
        >
          1 week
        </Button>
      </div>
      <ApexCharts
        type="line"
        options={options}
        height={450}
        series={options.series}
      ></ApexCharts>
    </div>
  );
};

export default Chart;
