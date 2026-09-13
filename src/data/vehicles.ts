import hero from "@/assets/hero.jpg";

export type Vehicle = {
  id: string;
  stock: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  transmission: string;
  drivetrain: string;
  fuel: string;
  exterior: string;
  image: string;
  highlights: string[];
};

export const vehicles: Vehicle[] = [
  {
    id: "2024-bmw-x5",
    stock: "LM1024",
    year: 2024,
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    price: 58900,
    mileage: 12400,
    transmission: "8-Speed Automatic",
    drivetrain: "All-Wheel Drive",
    fuel: "Gasoline",
    exterior: "Carbon Black",
    image: hero,
    highlights: ["Panoramic roof", "Heated seats", "Harman Kardon audio", "Clean history"],
  },
  {
    id: "2022-ford-f150",
    stock: "LM0942",
    year: 2022,
    make: "Ford",
    model: "F-150",
    trim: "Lariat SuperCrew",
    price: 44250,
    mileage: 31800,
    transmission: "10-Speed Automatic",
    drivetrain: "4x4",
    fuel: "Gasoline",
    exterior: "Agate Black",
    image: hero,
    highlights: ["Tow package", "360 camera", "Leather interior", "One owner"],
  },
  {
    id: "2023-toyota-camry",
    stock: "LM0877",
    year: 2023,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    price: 26400,
    mileage: 18950,
    transmission: "8-Speed Automatic",
    drivetrain: "Front-Wheel Drive",
    fuel: "Gasoline",
    exterior: "Midnight Metallic",
    image: hero,
    highlights: ["Apple CarPlay", "Blind spot monitor", "Fuel efficient", "Service records"],
  },
  {
    id: "2021-jeep-grand-cherokee",
    stock: "LM0765",
    year: 2021,
    make: "Jeep",
    model: "Grand Cherokee",
    trim: "Limited",
    price: 31900,
    mileage: 42300,
    transmission: "8-Speed Automatic",
    drivetrain: "4x4",
    fuel: "Gasoline",
    exterior: "Diamond Black",
    image: hero,
    highlights: ["Heated steering wheel", "Remote start", "Trailer hitch", "New tires"],
  },
];

export const getVehicle = (id: string) => vehicles.find((v) => v.id === id);

export const formatPrice = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatMiles = (n: number) => `${n.toLocaleString("en-US")} mi`;
