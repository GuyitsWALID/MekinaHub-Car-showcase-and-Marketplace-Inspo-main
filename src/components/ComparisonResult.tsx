
import { CarProps } from "../types";

interface ResultProps {
  result: string;
  car1: CarProps;
  car2: CarProps;
}

export default function ComparisonResult({ result, car1, car2 }: ResultProps) {
  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">{car1.make} {car1.model}</h3>
          <p className="text-gray-600 dark:text-gray-300">Year: {car1.year}</p>
          <p className="text-gray-600 dark:text-gray-300">MPG: {car1.city_mpg}/{car1.highway_mpg}</p>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">{car2.make} {car2.model}</h3>
          <p className="text-gray-600 dark:text-gray-300">Year: {car2.year}</p>
          <p className="text-gray-600 dark:text-gray-300">MPG: {car2.city_mpg}/{car2.highway_mpg}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">AI-Powered Analysis</h4>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          {result.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}