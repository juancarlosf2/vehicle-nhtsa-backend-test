export interface VehicleType {
  id: number;
  name: string;
}

export interface Make {
  id: number;
  name: string;
  vehicleTypes: VehicleType[];
}

export interface VehicleData {
  makes: Make[];
  ingestedAt: string;
}
