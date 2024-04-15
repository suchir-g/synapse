import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const ResponsiveKonvaImage = ({ imageUrl }) => {
  const [size, setSize] = useState({
    width: window.innerWidth - 100,
    height: window.innerHeight,
  });
  const [image] = useImage(imageUrl);

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth - 100,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Stage width={size.width} height={size.height}>
      <Layer>
        {image && (
          <KonvaImage image={image} width={size.width} height={size.height} />
        )}
      </Layer>
    </Stage>
  );
};

export default ResponsiveKonvaImage;
