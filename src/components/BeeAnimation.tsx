import { useEffect, useState } from "react";
import beeMascot from "@/assets/bee-mascot.png";

const BeeAnimation = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveBee = () => {
      const newX = Math.random() * 100;
      const newY = Math.random() * 100;
      setPosition({ x: newX, y: newY });
    };

    const interval = setInterval(moveBee, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-[4000ms] ease-in-out"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <img
        src={beeMascot}
        alt="Carry Bee Mascot"
        className="w-16 h-16 animate-float drop-shadow-lg"
      />
    </div>
  );
};

export default BeeAnimation;
