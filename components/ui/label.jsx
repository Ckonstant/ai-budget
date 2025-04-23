"use client";

import React from "react";

const Label = React.forwardRef(({ className, htmlFor, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none ${className || ""}`}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };