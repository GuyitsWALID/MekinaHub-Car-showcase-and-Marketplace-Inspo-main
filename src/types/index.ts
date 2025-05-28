import { MouseEventHandler } from "react";

export interface CarProps {
  city_mpg: number;
  vehicleClass: string;  // Renamed from 'class'
  combination_mpg: number;
  cylinders: number;
  displacement: number;
  drive: string;
  fuel_type: string;
  highway_mpg: number;
  make: string;
  model: string;
  transmission: string;
  year: number;
}


export interface FilterProps {
  make?: string;
  year?: number;
  model?: string;
  limit?: number;
  fuel?: string;
}

export interface HomeProps {
  searchParams: FilterProps;
}

export interface CarCardProps {
  model: string;
  make: string;
  mpg: number;
  transmission: string;
  year: number;
  drive: string;
  cityMPG: number;
}

export interface CustomButtonProps {
  isDisabled?: boolean;
  btnType?: "button" | "submit";
  containerStyles?: string;
  textStyles?: string;
  title: string;
  rightIcon?: string;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface OptionProps {
  title: string;
  value: string;
}

export interface CustomFilterProps {
  title: string;
  options: OptionProps[];
}

export interface ShowMoreProps {
  pageNumber: number;
  isNext: boolean;
}

export interface SearchManuFacturerProps {
  manufacturer: string;
  setManuFacturer: (manufacturer: string) => void;
}
export interface Contact {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  dealer_id: string; // Retaining this as it's in the original Messages.tsx
  message: string;
  is_read: boolean;
  created_at: string;
  type: 'text' | 'image' | 'file';
  file_url: string | null;
}