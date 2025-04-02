export interface Point {
  x: number;
  y: number;
  srid?: number;
}

export interface Geometry {
  type: string;
  coordinates: number[];
  srid?: number;
}

export interface PostGISPoint extends Point {
  type: 'Point';
}
