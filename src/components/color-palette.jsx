import { ColorSwatchIcon, XIcon } from "@heroicons/react/outline";
import { SketchPicker, TwitterPicker } from "react-color";
import { useState } from "react";

export default function ColorPalette({ initialColor, onColorChange }) {
  const [color, setColor] = useState("#ffffff");
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
    setColor(newColor.hex);
    onColorChange(newColor.hex);
  }

  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-4">
          <div className="col-span-1">
            <button
              className="bg-gray-200 px-4 py-4 text-white rounded"
              onClick={() => setShowPicker(!showPicker)}
            >
              {showPicker ? (
                <XIcon
                  className="h-6 w-6 text-ft-blue-300 "
                  aria-hidden="true"
                />
              ) : (
                <ColorSwatchIcon
                  className="h-6 w-6 text-ft-blue-300 "
                  aria-hidden="true"
                />
              )}
            </button>
            {showPicker && (
              <div className="absolute top-0 left-0 z-10 mt-10">
                <SketchPicker color={color} onChange={handleColorChange} />
              </div>
            )}
          </div>
          <div className="col-span-3">
            <TwitterPicker
              width="250px"
              colors={[
                "#EB144C",
                "#F78DA7",
                "#0693E3",
                "#00D084",
                "#FCB900",
                "#9900EF",
              ]}
              triangle="hide"
              styles={twitterStyle}
              onChange={handleColorChange}
            />
          </div>
        </div>
        <div className="hidden md:block mt-5">Selected color: {color} </div>
        <div
          className="mt-4"
          style={{ backgroundColor: color, height: "250px" }}
        />
      </div>
    </div>
  );
}