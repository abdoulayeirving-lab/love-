import React, { useState, useRef } from "react";

interface Hover3DTiltProps {
  children: React.ReactNode;
  className?: string;
}

export default function Hover3DTilt({ children, className = "" }: Hover3DTiltProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse relative to the element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map to a range of -15deg to 15deg
    const rX = ((mouseY / height) - 0.5) * -12; // tilt on X axis
    const rY = ((mouseX / width) - 0.5) * 12;   // tilt on Y axis

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
