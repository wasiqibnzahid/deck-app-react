import React from "react";
import { colorHelper } from "../helper/color-helper";

interface LegendBarProps {
  min: number;
  max: number;
  numSegments: number; // Number of color segments in the bar
  height: number; // Height of the bar in pixels
  width: number; // Width of the bar in pixels
}

const LegendBar: React.FC<LegendBarProps> = ({
  min,
  max,
  numSegments,
  height,
  width,
}) => {
  const segmentHeight = height / numSegments; // Height of each segment

  // Generate color segments
  const roundToNearestHundred = (value: number): number => {
    return Math.round(value / 100) * 100;
  };

  const colors = Array.from({ length: numSegments }, (_, i) => {
    const rawValue = min + (i / (numSegments - 1)) * (max - min);
    const roundedValue = roundToNearestHundred(rawValue);
    return { val: roundedValue, color: colorHelper(roundedValue, min, max) };
  });

  return (
    <div
      style={{
        height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {colors.map(({ color, val }, index) => (
        <div className="flex flex-nowrap justify-end items-center gap-2">
          <div
            style={{
              fontSize: "12px",
            }}
            className="text-right"
          >
            {val.toFixed(0)}
          </div>
          <div
            key={val + JSON.stringify(color)}
            style={{
              height: segmentHeight,
              backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${
                color[3] / 255
              })`,
              width,
              //   borderBottom: "1px solid #000", // Optional: to separate segments
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default LegendBar;
