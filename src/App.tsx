import MapComponent from "./components/MapComponent";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

const states = [
  { name: "Alabama", value: [32.806671, -86.79113] },
  { name: "Alaska", value: [61.370716, -152.404419] },
  { name: "Arizona", value: [33.217845, -111.093735] },
  { name: "Arkansas", value: [34.969704, -92.373123] },
  { name: "California", value: [36.116203, -119.681564] },
  { name: "Colorado", value: [39.059811, -105.311104] },
  { name: "Connecticut", value: [41.597782, -72.755371] },
  { name: "Delaware", value: [39.318523, -75.507141] },
  { name: "Florida", value: [27.766279, -81.686783] },
  { name: "Georgia", value: [33.040619, -83.643074] },
  { name: "Hawaii", value: [21.094318, -157.498337] },
  { name: "Idaho", value: [44.240459, -114.478828] },
  { name: "Illinois", value: [40.349457, -88.986137] },
  { name: "Indiana", value: [39.849426, -86.258278] },
  { name: "Iowa", value: [42.011539, -93.210526] },
  { name: "Kansas", value: [37.266527, -95.143561] },
  { name: "Kentucky", value: [37.66814, -84.670067] },
  { name: "Louisiana", value: [31.169546, -91.867805] },
  { name: "Maine", value: [44.693947, -69.381927] },
  { name: "Maryland", value: [39.063946, -76.802101] },
  { name: "Massachusetts", value: [42.230171, -71.530106] },
  { name: "Michigan", value: [43.326618, -84.536095] },
  { name: "Minnesota", value: [45.694454, -93.900192] },
  { name: "Mississippi", value: [32.741646, -89.678696] },
  { name: "Missouri", value: [38.456085, -92.288368] },
  { name: "Montana", value: [46.921925, -110.454353] },
  { name: "Nebraska", value: [41.12537, -98.268082] },
  { name: "Nevada", value: [38.313515, -117.055374] },
  { name: "New Hampshire", value: [43.452492, -71.563896] },
  { name: "New Jersey", value: [40.298904, -74.521011] },
  { name: "New Mexico", value: [34.840515, -106.248482] },
  { name: "New York", value: [42.165726, -74.948051] },
  { name: "North Carolina", value: [35.630066, -79.806419] },
  { name: "North Dakota", value: [47.528912, -99.784012] },
  { name: "Ohio", value: [40.388783, -82.764915] },
  { name: "Oklahoma", value: [35.565342, -96.928917] },
  { name: "Oregon", value: [44.572021, -122.070938] },
  { name: "Pennsylvania", value: [40.590752, -77.209755] },
  { name: "Rhode Island", value: [41.680893, -71.51178] },
  { name: "South Carolina", value: [33.856892, -80.945007] },
  { name: "South Dakota", value: [44.299782, -99.438828] },
  { name: "Tennessee", value: [35.747845, -86.692345] },
  { name: "Texas", value: [31.054487, -97.563461] },
  { name: "Utah", value: [40.150032, -111.862434] },
  { name: "Vermont", value: [44.045876, -72.710686] },
  { name: "Virginia", value: [37.769337, -78.169968] },
  { name: "Washington", value: [47.400902, -121.490494] },
  { name: "West Virginia", value: [38.491226, -80.954163] },
  { name: "Wisconsin", value: [44.268543, -89.616508] },
  { name: "Wyoming", value: [42.755966, -107.30249] },
];

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
  const [mode, setMode] = useState<"bigquery" | "model">("bigquery");
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
        let isError = false;
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
            isError = true;
            return [];
          });
        if (isError) return;
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
      let isError = false;
      if (searchText) {
        apiRes = await searchApi(
          searchText,
          mode,
          abortControllerRef.current.signal
        ).catch((e) => {
          isError = true;
          return [];
        });
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
          .catch((e) => {
            isError = true;
            return [];
          });
      }
      console.log("API RES IS ", apiRes);
      if (isError) return;
      setSelectedItems([...apiRes]);
      if (all.length) {
        setData(all);
      }

      console.log("SETTING FALSE");

      setLoading(false);
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
  const [map, setMap] = useState(states[0]?.value);
  const dataToUse = useMemo(() => {
    const map: any = {};
    selectedItems.forEach((item) => (map[item.IId] = true));
    return data.map((item) => ({
      ...item,
      selected: map?.[item.IId] ? true : false,
    }));
  }, [data, selectedItems]);
  return (
    <div className="flex py-4 px-8 h-screen">
      <div className="pr-2 w-1/2">
        <MapComponent
          map={map}
          onItemClick={onItemClick}
          data={dataToUse}
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
      </div>

      <div className="w-1/2 pl-2">
        <div className="w-[300px] ml-auto mb-2">
          <select
            id="mode"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={mode}
            onChange={(e) => {
              e.target.value === "bigquery"
                ? setMode("bigquery")
                : setMode("model");
            }}
          >
            <option value="bigquery">BigQuery</option>
            <option value="model">model</option>
          </select>
        </div>
        <div className="w-[300px] ml-auto">
          <select
            id="states"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={JSON.stringify(map)}
            onChange={(e) => {
              const val = JSON.parse(e.target.value);
              setMap(val);
            }}
          >
            {states.map((state) => (
              <option key={state.name} value={JSON.stringify(state.value)}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
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
