import MapView, { Polyline, Polygon, Region } from "react-native-maps";
import { View, Text, Pressable } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { getCells } from "../../lib/api";

// const USER_ID = "00000000-0000-0000-0000-000000000001"; // Set real ID after login


// function cellToPolygon(cellId: string): { coords: { latitude: number; longitude: number }[] } {
//     // For MVP convert z/x/y to bbox and return 4 points. Needs utils depends on Z
//     // For now empty view: nothing falls and nothing draws
//     return { coords: [] };
// }

// Map and sync
export default function Home() {
    console.log('home');
    // const [cells, setCells] = useState<string[]>([]);
    // const [region, setRegion] = useState<Region>({ latitude: 45.2671, longitude: 19.8335, latitudeDelta: 0.2, longitudeDelta: 0.2 });

    // useEffect(() => {
    //     (async () => {
    //     const data = await getCells(USER_ID);
    //     setCells(data.cells);
    // })();
    // }, []);

    // const polygons = useMemo(() => cells.map((id) => cellToPolygon(id)), [cells]);

    return (
        <View style={{ flex: 1 }}>
        {/* <MapView style={{ flex: 1 }} region={region} onRegionChangeComplete={setRegion} /> */}
        <View style={{ position: "absolute", top: 16, right: 16 }}>
        <Pressable style={{ backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
        <Text>Synchronize</Text>
        </Pressable>
        </View>
        </View>
    );
}