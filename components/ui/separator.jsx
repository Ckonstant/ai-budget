"use client";

import React from "react";

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <hr
      ref={ref}
      className={`${className} ${orientation === "horizontal" ? "w-full" : "h-full w-px"}`}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };