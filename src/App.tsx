import MapComponent from "./components/MapComponent";
import { useEffect, useRef, useState, useCallback } from "react";
import { TData } from "./types/types";
import { getClosest, searchApi } from "./api/api";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Function to check if the user has moved significantly
function hasMovedSignificantly(
  newLatitude: number,
  newLongitude: number,
  initialLatitude: number,
  initialLongitude: number,
  thresholdMeters = 250000
) {
  const distance = haversineDistance(
    initialLatitude,
    initialLongitude,
    newLatitude,
    newLongitude
  );
  console.log("THE DISTANCE IS ", distance);
  return distance >= thresholdMeters;
}

export const App = () => {
  const [isFirst, setIsFirst] = useState(true);
  const [selectedItems, setSelectedItems] = useState<TData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    long: 0,
  });
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

  const myFn = useCallback(
    async (lat: number, long: number) => {
      if (!searchText) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        setLoading(true);
        abortControllerRef.current = new AbortController();
        const res = await getClosest(
          lat || 36.7849143994791,
          long || -92.1959309706847,
          abortControllerRef.current.signal
        )
          .then((data) => {
            console.log("HERE IS DATA");
            const closestIds = data.closest.map((item) => item.IId);
            const all = data.all.map((item) =>
              closestIds.includes(item.IId) ? { ...item, selected: true } : item
            );
            setData(all);
            setLoading(false);
            return data.closest;
          })
          .catch((e) => {
            console.log("AAAA");
            return [];
          });
        setSelectedItems(res);
      }
    },
    [searchText, coordinates]
  );
  const abortControllerRef = useRef(new AbortController());
  const fetchData = useCallback(
    async function () {
      console.log("SETTING TRUE");
      setLoading(true);
      let apiRes: TData[] = [];
      let all: TData[] = [];
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
        )
          .then((data) => {
            console.log("HERE IS DATA");
            const closestIds = data.closest.map((item) => item.IId);
            all = data.all.map((item) =>
              closestIds.includes(item.IId) ? { ...item, selected: true } : item
            );
            return data.closest;
          })
          .catch((e) => []);
      }

      apiRes.forEach((item) => (item.selected = true));
      setSelectedItems(apiRes);
      if (all.length) {
        setData(all);
      }
      // setTimeout(() => {
      console.log("SETTING FALSE");

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
        <MapComponent
          onItemClick={onItemClick}
          data={data}
          lat={selectedItems?.[0]?.SLat}
          long={selectedItems?.[0]?.SLong}
          setLocation={(lat, long) => {
            console.log("PREV VALS", coordinates.lat, coordinates.long);
            if (coordinates.lat && coordinates.long) {
              if (
                hasMovedSignificantly(
                  lat,
                  long,
                  coordinates.lat,
                  coordinates.long
                )
              ) {
                if (isFirst) {
                  setIsFirst(false);
                  setCoordinates({ lat, long });
                  return;
                }
                myFn(lat, long);
                setCoordinates({ lat, long });
              }
            } else if (!coordinates.lat && !coordinates.long) {
              setCoordinates({ lat, long });
            }
          }}
        />
        ;
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
