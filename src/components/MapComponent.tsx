import React, { useEffect, useMemo, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Color, HeatmapLayer, ScatterplotLayer } from "deck.gl";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { MapView } from "deck.gl";
import { TData } from "../types/types";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { colorHelper } from "../helper/color-helper";
import LegendBar from "./legend-bar";

/**
 * @type {TData[]}
 */

const INITIAL_VIEW_STATE = {
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
};

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

const mapboxToken =
  "pk.eyJ1IjoidWNmLW1hcGJveCIsImEiOiJjbDBiYzlveHgwdnF0M2NtZzUzZWZuNWZ4In0.l9J8ptz3MKwaU9I4PtCcig";

interface MapComponentProps {
  onItemClick?: (item: TData) => void;
  data: TData[];
  lat?: number;
  long?: number;
  setLocation?: (lat: number, long: number) => void;
  searchText?: string;
  map: number[];
  isHeatmap: boolean;
}
const MapComponent: React.FC<MapComponentProps> = ({
  onItemClick = () => {},
  data,
  lat,
  long,
  map,
  setLocation,
  isHeatmap = false,
}) => {
  const [itemList, setItemList] = useState<TData[]>(data);
  const [selectedItem, setSelectedItem] = useState<
    { x: number; y: number } & TData
  >(null);
  const [initialState, _setInitialState] = useState({
    ...INITIAL_VIEW_STATE,
    longitude: -71.989491,
    latitude: 41.583495,
  });
  function setInitialState(i: typeof initialState) {
    _setInitialState(i);
    setLocation(i.latitude, i.longitude);
  }
  const handleClick = ({ object = null }: { object?: TData }) => {
    console.log(itemList);
    if (object) {
      onItemClick(object);
      const itemIndex = itemList.findIndex(
        (item) => item.SLat === object.SLat && item.SLong === object.SLong
      );
      const items = itemList.filter(
        (item) => item.SLat === object.SLat && item.SLong === object.SLong
      );
      const newList = [...itemList];
      if (object.selected) {
        // newList[itemIndex].color = defaultColor;
      } else {
        // newList[itemIndex].color = selectedColor;
      }
      newList[itemIndex].selected = !newList[itemIndex].selected;
      setItemList(newList);
    }
  };
  useEffect(() => {
    if (lat && long && itemList.length === 0) {
      setInitialState({
        ...initialState,
        latitude: lat,
        longitude: long,
      });
    }
    setItemList(data);
  }, [data]);
  useEffect(() => {
    setInitialState({
      ...initialState,
    });
  }, []);
  const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
  });

  const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000],
  });

  const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000],
  });
  const lightingEffect = new LightingEffect({
    ambientLight,
    pointLight1,
    pointLight2,
  });
  const [minVal, maxVal] = useMemo(() => {
    const maxVal = Math.max(...itemList.map((item) => item.avg_weekly_sales));
    const minVal = Math.min(...itemList.map((item) => item.avg_weekly_sales));
    return [minVal, maxVal];
  }, [itemList]);
  const layers = useMemo(() => {
    if (!isHeatmap)
      return [
        new ScatterplotLayer({
          id: "scatterplot-layer",
          data: itemList,
          getPosition: (d) => {
            return [d.SLong, d.SLat];
          },
          getRadius: (d) => 2500,
          getFillColor: (d: TData) =>
            colorHelper(d.avg_weekly_sales, minVal, maxVal, 180),
          onClick: handleClick,
          onHover: (e) => {
            if (e.object) {
              setSelectedItem({ x: e.x, y: e.y, ...e.object });
            } else {
              setSelectedItem(null);
            }
          },
          pickable: true,
        }),
      ];

    const newItemList = itemList.map((item) => ({
      ...item,
      avg_weekly_sales: maxVal - item.avg_weekly_sales,
    }));
    return [
      // new HexagonLayer({
      //   id: "hexagon-layer",
      //   data: itemList,
      //   getPosition: (d: any) => [d.SLong, d.SLat],
      //   getElevationWeight: (d: any) => d.avg_weekly_sales,
      //   elevationScale: 50, // Adjusts the height of the hexagons
      //   extruded: true, // Enables the 3D effect
      //   radius: 1000, // Adjust the radius of each hexagon
      //   colorRange,
      //   pickable: true,
      //   elevationRange: [0, 3000],
      //   upperPercentile: 100,
      //   coverage: 1,
      //   material: {
      //     ambient: 0.1,
      //     diffuse: 0.6,
      //     shininess: 32,
      //     specularColor: [60, 64, 70],
      //   },
      //   // Removed upperPercentile and lowerPercentile to use all the data

      // }),

      new HeatmapLayer({
        id: "heatmap-layer",
        data: newItemList,
        getPosition: (d) => [d.SLong, d.SLat], // longitude and latitude positions
        getWeight: (d) => d.avg_weekly_sales, // data to visualize, similar to getElevationWeight
        radiusPixels: 20, // Adjusts the radius of each heatmap point, change as needed
        intensity: 1, // Adjust intensity of the heatmap
        threshold: 0.03, // Minimum density threshold to render a heatmap
        pickable: true, // Enable picking for interactivity
      }),
    ];
  }, [itemList, isHeatmap]);

  useEffect(() => {
    setInitialState({ ...initialState, latitude: map[0], longitude: map[1] });
  }, [map]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {itemList?.length > 0 && !isHeatmap && (
        <div className="absolute z-10 right-[10px] bottom-[60px] w-[350px] ">
          <LegendBar
            height={50}
            width={50}
            min={minVal}
            max={maxVal}
            numSegments={10}
          />
        </div>
      )}
      <div
        style={{
          height: "calc(100% - 30px)",
          width: "100%",
        }}
        className="relative"
      >
        <DeckGL
          layers={layers}
          initialViewState={initialState as any}
          height="100%"
          effects={[lightingEffect]}
          width="100%"
          controller
          onViewStateChange={(e) => setInitialState(e.viewState as any)}
        >
          {/* @ts-ignore */}
          <MapView controller height="100%" width="100%" id="map">
            <Map
              style={{}}
              mapboxAccessToken={mapboxToken}
              // mapStyle="mapbox://styles/mapbox/dark-v9"
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            />
          </MapView>
        </DeckGL>
      </div>

      {selectedItem && (
        <div
          style={{
            left: selectedItem.x + window.innerWidth * 0.235,
            top: selectedItem.y - 10,
            position: "fixed",
          }}
          className="fixed py-2 -translate-x-[37%] -translate-y-[110%]  px-4 rounded-md bg-slate-500 text-white"
        >
          <p className="font-bold text-center">Info</p>
          <p className="text-ellipsis max-w-[200px] text-nowrap overflow-hidden">
            <span className="font-bold">Name: </span>
            {selectedItem.Title}
          </p>
          <p>
            <span className="font-bold">Sales: </span>
            {selectedItem.avg_weekly_sales}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
