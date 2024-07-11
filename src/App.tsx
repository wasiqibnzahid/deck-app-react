import MapComponent from "./components/MapComponent";
import React, { useState } from "react";
import { TData } from "./types/types";

export const App = () => {
  const [selectedItems, setSelectedItems] = useState<TData[]>([]);
  const onItemClick = (newItem: TData) => {
    const itemIndex = selectedItems.findIndex((item) => item.id === newItem.id);
    const newList = [...selectedItems];
    if (itemIndex === -1) {
      newList.push(newItem);
    } else {
      newList.splice(itemIndex, 1);
    }
    setSelectedItems(newList);
  };
  return (
    <div className="flex py-4 px-8 h-screen">
      <div className="pr-2 w-1/2">
        <MapComponent onItemClick={onItemClick} />;
      </div>
      <div className="w-1/2 pl-2">
        <input
          className="block my-2 mx-auto shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Username"
        />
        <div className="flex max-w-100% flex-wrap max-h-[calc(100%_-_50px)] overflow-y-auto">
          {selectedItems.map((item) => (
            <div key={item.id} className="flex w-[20%] align-center px-2 my-2">
              <img
                className="w-full object-contain"
                src={item.image}
                alt={item.image}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
