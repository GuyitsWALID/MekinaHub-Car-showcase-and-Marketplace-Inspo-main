import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";

// Helper function to convert URL segments to a user-friendly format
const formatSegment = (segment: string) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const DynamicBreadcrumbs: React.FC = () => {
  const location = useLocation();
  // Split the pathname into segments and remove any empty strings
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always include the Home breadcrumb */}
        <BreadcrumbItem>
          <Link to="/">
            Home
          </Link>
        </BreadcrumbItem>
        {pathnames.map((segment, index) => {
          // Build the cumulative path for each breadcrumb
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          return (
            <React.Fragment key={routeTo}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                ) : (
                  <Link to={routeTo}>
                    {formatSegment(segment)}
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DynamicBreadcrumbs;
