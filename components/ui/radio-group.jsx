"use client";

import React from "react";

const RadioGroup = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className={className} ref={ref} {...props}>
      {children}
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input 
      type="radio" 
      className={className} 
      ref={ref} 
      {...props} 
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };