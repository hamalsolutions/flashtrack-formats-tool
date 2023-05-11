import { React, useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { ZoomInIcon, ZoomOutIcon } from "@heroicons/react/outline";
import ToolbarLabel from "./components/toolbar-label";
import SidePanel from "./components/side-panel";

export const Background = ({ height, width }) => {
  let newWidth = 0;
  let newX = 0;
  let newY = 0;
  let newHeight = 0;
  if (width < 768) {
    newWidth = width - width * 0.2;
    newHeight = height - height * 0.2;
    newX = (width * 0.2) / 2;
    newY = 10;
  } else {
    newWidth = width - width * 0.3;
    newHeight = height - height * 0.05;
    newX = (width * 0.3) / 2;
    newY = 20;
  }
  return (
    <Rect
      height={newHeight}
      width={newWidth}
      x={newX}
      y={newY}
      fill={"white"}
      shadowColor={"black"}
      shadowBlur={10}
      shadowOpacity={0.5}
    />
  );
};

const FONT_FAMILY_LIST = [
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Verdana', value: 'Verdana' },
];


export default function App() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      const container = containerRef.current;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        setDimensions({ width, height });
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [state, setState] = useState({
    isDragging: false,
    x: 10,
    y: 50,
  });

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY_LIST[0].value);

  return (
    <div className="mx-auto p-0 lg:px-1 mt-1">
      <div className="grid grid-cols-12">
        <div className="md:col-span-4">
          <SidePanel setFontFamily={setFontFamily}/>
        </div>
        <div className="col-span-12 md:col-span-8">
          <ToolbarLabel />
          {/* A partir de aqui Canvas*/}
          <div
            className="containerCanvas"
            ref={containerRef}
            style={{ width: "100%", height: "80vh" }}
          >
            <Stage
              width={dimensions.width}
              height={dimensions.height}
              style={{ border: "1px solid lightgray" }}
            >
              <Layer>
                <Background
                  width={dimensions.width}
                  height={dimensions.height}
                />
                {/* Esto es solo un ejemplo de drag and drop*/}
                <Text
                  text="Draggable Text"
                  x={state.x}
                  y={state.y}
                  fontFamily={fontFamily}
                  fontSize={20}
                  draggable
                  fill={state.isDragging ? "green" : "black"}
                  onDragStart={() => {
                    setState({
                      isDragging: true,
                    });
                  }}
                  onDragEnd={(e) => {
                    setState({
                      isDragging: false,
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                />
              </Layer>
            </Stage>

            {/* A partir de aqui Zoom*/}
            <div className="flex justify-center z-10 -mt-20 md:-mt-11">
              <span className="isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10"
                >
                  <ZoomOutIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10">
                  32%
                </span>
                <button
                  type="button"
                  className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10"
                >
                  <ZoomInIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}