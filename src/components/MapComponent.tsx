import React, { useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { ScatterplotLayer } from "deck.gl";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { MapView } from "deck.gl";
import { BrushingExtension } from "@deck.gl/extensions";
import { TData } from "../types/types";
/**
 * @type {TData[]}
 */

const INITIAL_VIEW_STATE = {
  longitude: -71.989491,
  latitude: 41.583495,
  zoom: 7,
  pitch: 0,
  bearing: 0,
};

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
  searchText?: string
}
const MapComponent: React.FC<MapComponentProps> = ({
  onItemClick = () => {},
  data,
  lat,
  long,
  setLocation,
}) => {
  const [itemList, setItemList] = useState<TData[]>(data);
  const [selectedItem, setSelectedItem] = useState<
    { x: number; y: number } & TData
  >(null);
  const [initialState, _setInitialState] = useState({ ...INITIAL_VIEW_STATE });
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
      console.log(items);
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
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const layers = useMemo(() => {
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
  }, [itemList]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <DeckGL
        layers={layers}
        initialViewState={initialState as any}
        height="100%"
        width="100%"
        controller
        onViewStateChange={(e) => setInitialState(e.viewState as any)}
      >
        {/* @ts-ignore */}
        <MapView controller height="100%" width="100%" id="map">
          <Map
            style={{}}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          />
        </MapView>
      </DeckGL>

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
            {selectedItem.weekly_sales}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
