'use client'


import {useState} from "react";
import Image from 'next/image'; 
import exp from "constants";
// import { CarProps } from "@/components/CarCard";
import { Button } from "./ui/button";



export interface CarProps {
    city_mpg: number;
    class: string;
    combination_mpg: number;
    cylinders:number;
    displacement: number;
    drive: string;
    fuel_type: string;
    highway_mpg: number;
    make: string;
    model: string;
    transmission: string;
    year: number;
}

interface CarCardProps {
    car: CarProps;
}
const CarCard = ({car}: CarCardProps) => {
  return <div>CarCard</div>;
};

export default CarCard;
