import { ColorSwatchIcon, XIcon } from "@heroicons/react/outline";
import { SketchPicker, TwitterPicker } from "react-color";
import { useState } from "react";

export default function ColorPalette({ initialColor, onColorChange }) {
  const [color, setColor] = useState({
    hex: "#ffffff",
    rgb: {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    },
  });
  const [showPicker, setShowPicker] = useState(false);

  const twitterStyle = {
    default: {
      input: {
        display: "none",
      },
      hash: {
        display: "none",
      },
    },
  };

  function handleColorChange(newColor) {
    setColor({
      hex: newColor.hex,
      rgb: newColor.rgb,
    });
    onColorChange({
      hex: newColor.hex,
      rgb: newColor.rgb,
    });
  }

  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-4">
          <div className="col-span-1">
            <button
              className="bg-gray-200 p-4 text-white rounded"
              onClick={() => setShowPicker(!showPicker)}
            >
              {showPicker ? (
                <XIcon className="h-6 w-6 text-[#3c5865]" aria-hidden="true" />
              ) : (
                <ColorSwatchIcon
                  className="h-6 w-6 text-[#3c5865]"
                  aria-hidden="true"
                />
              )}
            </button>
            {showPicker && (
              <div className="absolute top-0 left-0 z-10 mt-10">
                <SketchPicker color={color.hex} onChange={handleColorChange} />
              </div>
            )}
          </div>
          <div className="col-span-3">
            <TwitterPicker
              width="210px"
              colors={["#EB144C", "#F78DA7", "#0693E3", "#00D084", "#9900EF"]}
              triangle="hide"
              styles={twitterStyle}
              onChange={handleColorChange}
            />
          </div>
        </div>
        <div className="hidden md:block mt-4">Selected color: {color.hex} </div>
        <div
          className="mt-4"
          style={{ backgroundColor: color.hex, height: "250px" }}
        />
      </div>
    </div>
  );
}
