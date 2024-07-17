import MapComponent from "./components/MapComponent";
import { useEffect, useRef, useState, useCallback } from "react";
import { TData } from "./types/types";
import { getClosest, searchApi } from "./api/api";

export const App = () => {
  const [selectedItems, setSelectedItems] = useState<TData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const onItemClick = (newItem: TData) => {
    const itemIndex = selectedItems.findIndex(
      (item) => item.IId === newItem.IId
    );
    const newList = [...selectedItems];
    if (itemIndex === -1) {
      newList.push(newItem);
    } else {
      newList.splice(itemIndex, 1);
    }
    setSelectedItems(newList);
  };
  const abortControllerRef = useRef(new AbortController());
  const fetchData = useCallback(
    async function () {
      setLoading(true);
      let apiRes: TData[] = [];
      if (searchText) {
        apiRes = await searchApi(
          searchText,
          abortControllerRef.current.signal
        ).catch((e) => []);
      } else {
        apiRes = await getClosest(
          36.7849143994791,
          -92.1959309706847,
          abortControllerRef.current.signal
        ).catch((e) => []);
      }

      apiRes.forEach((item) => (item.selected = true));
      setSelectedItems(apiRes);
      setData(apiRes);
      // setTimeout(() => {
        setLoading(false);
      // }, 2000);
    },
    [searchText]
  );
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchData().catch();
  }, [fetchData]);
  return (
    <div className="flex py-4 px-8 h-screen">
      <div className="pr-2 w-1/2">
        <MapComponent onItemClick={onItemClick} data={data} />;
      </div>
      <div className="w-1/2 pl-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="block my-2 mx-auto shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Search"
        />
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div
              style={{
                border: "solid",
                borderLeftColor: "transparent",
              }}
              className="animate-spin h-16 w-16 rounded-full border-black border-r-transparent"
            ></div>
          </div>
        )}
        {!loading && (
          <div className="flex max-w-100% flex-wrap max-h-[calc(100%_-_50px)] overflow-y-auto">
            {selectedItems.map((item) => (
              <div
                key={item.IId}
                className="flex w-[20%] align-center px-2 my-2"
              >
                <img
                  className="w-full object-contain"
                  src={item.Image}
                  alt={item.Image}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
