import React, { useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Color, HeatmapLayer, HexagonLayer, ScatterplotLayer } from "deck.gl";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { MapView } from "deck.gl";
import { BrushingExtension } from "@deck.gl/extensions";
import { TData } from "../types/types";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { Checkbox, Radio, Switch } from "@chakra-ui/react";

/**
 * @type {TData[]}
 */

const INITIAL_VIEW_STATE = {
  zoom: 7,
  pitch: 0,
  bearing: 0,
};
const HEATMAP_INITIAL_VIEW_STATE = {
  zoom: 7,
  pitch: 40.5,
  bearing: -27,
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
const defaultColor: any = [169, 169, 169];

const selectedColor: any = [57, 117, 206];

interface MapComponentProps {
  onItemClick?: (item: TData) => void;
  data: TData[];
  lat?: number;
  long?: number;
  setLocation?: (lat: number, long: number) => void;
  searchText?: string;
  map: number[];
}
const MapComponent: React.FC<MapComponentProps> = ({
  onItemClick = () => {},
  data,
  lat,
  long,
  map,
  setLocation,
}) => {
  const [isHeatmap, setIsHeatmap] = useState(false);
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
        newList[itemIndex].color = defaultColor;
      } else {
        newList[itemIndex].color = selectedColor;
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
    if (isHeatmap) {
      setInitialState({
        ...initialState,
        pitch: 40.5,
        bearing: -27,
      });
    } else {
      setInitialState({
        ...initialState,
        pitch: 0,
        bearing: 0,
      });
    }
  }, [isHeatmap]);
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

  const layers = useMemo(() => {
    if (!isHeatmap)
      return [
        new ScatterplotLayer({
          id: "scatterplot-layer",
          data: itemList,
          getPosition: (d) => {
            return [d.SLong, d.SLat];
          },
          getRadius: (d) => 5000,
          getFillColor: (d) => (d.selected ? selectedColor : defaultColor),
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
    return [
      new HexagonLayer({
        id: "hexagon-layer",
        data: itemList,
        getPosition: (d: any) => [d.SLong, d.SLat],
        getElevationWeight: (d: any) => d.avg_weekly_sales,
        elevationScale: 50, // Adjusts the height of the hexagons
        extruded: true, // Enables the 3D effect
        radius: 1000, // Adjust the radius of each hexagon
        colorRange,
        pickable: true,
        elevationRange: [0, 3000],
        upperPercentile: 100,
        coverage: 1,
        material: {
          ambient: 0.1,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [60, 64, 70],
        },
        // Removed upperPercentile and lowerPercentile to use all the data
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
      <div className="flex mb-2 justify-end gap-2 items-center px-2">
        <Switch
          colorScheme="purple"
          isChecked={isHeatmap}
          onChange={(e) => setIsHeatmap(e.target.checked)}
          id="change-heatmap"
        />
        <label>Show Heatmap</label>
      </div>
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
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
            />
          </MapView>
        </DeckGL>
      </div>

      {selectedItem && (
        <div
          style={{
            left: selectedItem.x,
            top: selectedItem.y,
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
