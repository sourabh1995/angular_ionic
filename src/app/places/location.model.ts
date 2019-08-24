export interface Coordinate {
    lat: number;
    lng: number;
}

export interface PlaceLocation extends Coordinate {
    address: string;
    staticMapImageUrl: string;
}
