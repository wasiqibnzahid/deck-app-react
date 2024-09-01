import React, { useMemo, useState } from "react";
import { Slider } from "antd";
import dayjs from "dayjs";

// Define a type for the range values
export interface Range {
  min: number;
  max: number;
}

interface Props {
  onChange: (start: string, end: string) => void;
  dateRange: string[];
  selectedRange: Range;
  setSelectedRange: (param: Range) => void;
}
const DateRangeSlider: React.FC<Props> = ({
  onChange,
  selectedRange,
  setSelectedRange,
  dateRange,
}) => {
  // Helper function to get the date range

  function getEnd(param: string) {
    return dayjs(param).endOf("month").format("YYYY-MM-DD");
  }
  // Array of dates

  // State to store the selected date range
  function formatDate(date: string) {
    return dayjs(date).format("MM/YY");
  }
  // Function to handle slider changes
  const handleSliderChange = (values: number[]) => {
    setSelectedRange({ min: values[0], max: values[1] });

    const startDate = dateRange[Math.ceil((values[0] - 1) / 3)];
    const endDate = dateRange[Math.ceil((values[1] - 1) / 3)];
    // Call the onChange prop with the start and end date strings
    onChange(startDate, getEnd(endDate));
  };

  return (
    <div className="mt-[0.5rem]">
      <Slider
        range
        value={[selectedRange.min, selectedRange.max]}
        min={1}
        max={12}
        step={3}
        onChange={handleSliderChange}
        marks={{
          1: formatDate(dateRange[0]),
          4: formatDate(dateRange[1]),
          7: formatDate(dateRange[2]),
          10: formatDate(dateRange[3]),
          12: formatDate(dateRange[4]),
        }}
      />
      <div className="text-center">
        {dateRange[Math.ceil((selectedRange.min - 1) / 3)]} to{" "}
        {getEnd(dateRange[Math.ceil((selectedRange.max - 1) / 3)])}
      </div>
    </div>
  );
};

export default DateRangeSlider;
