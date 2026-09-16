export type MapListing = {
  id: string;
  title: string;
  category: string;
  bagPrice: number;
  estimatedRetailValue: number;
  quantityAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  pickupDistrict: string;
  pickupAddress: string | null;
  lat: number;
  lng: number;
  seller: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  };
  _count?: { reservations: number };
};
