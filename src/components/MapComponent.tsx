import React, { useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { ScatterplotLayer } from "deck.gl";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { MapView } from "deck.gl";
import { TData } from "../types/types";
/**
 * @type {TData[]}
 */
import data from "../data/data.json";

const INITIAL_VIEW_STATE: any = {
  longitude: -122.41669,
  latitude: 37.78,
  zoom: 14,
  pitch: 0,
  bearing: 0,
};

const mapboxToken =
  "pk.eyJ1IjoidWNmLW1hcGJveCIsImEiOiJjbDBiYzlveHgwdnF0M2NtZzUzZWZuNWZ4In0.l9J8ptz3MKwaU9I4PtCcig";
const defaultColor = [169, 169, 169];

const selectedColor = [57, 117, 206];

interface MapComponentProps {
  onItemClick?: (item: TData) => void;
}
const MapComponent: React.FC<MapComponentProps> = ({
  onItemClick = () => {},
}) => {
  const [itemList, setItemList] = useState<TData[]>(data);
  const handleClick = ({ object = null }: { object?: TData }) => {
    if (object) {
      onItemClick(object);
      const itemIndex = itemList.findIndex((item) => item.id === object.id);
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

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <DeckGL
        layers={[
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data: itemList,
            getPosition: (d) => d.position,
            getRadius: (d) => d.radius,
            getFillColor: (d) => d.color,
            onClick: handleClick,
            pickable: true,
          }),
        ]}
        initialViewState={INITIAL_VIEW_STATE}
        height="100%"
        width="100%"
        controller
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
    </div>
  );
};

export default MapComponent;
