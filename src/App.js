import { React, Fragment, useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Image } from "react-konva";
import { ZoomInIcon, ZoomOutIcon } from "@heroicons/react/outline";
import ToolbarLabel from "./components/toolbar-label";
import SidePanel from "./components/side-panel";
import { LoadImage } from "./components/image-editor";

export const Background = ({ height, width, color }) => {
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
      fill={color}
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

const fields = [
  { name: "QTY", description: "QTY" },
  { name: "COLOR", description: "COLOR" },
  { name: "PCS", description: "PSC" },
  { name: "SIZE", description: "SIZE" },
  { name: "DESCRIPTION", description: "DESCRIPTION" },
  { name: "PRICE", description: "PRICE" },
  { name: "UPC", description: "UPC" },
  { name: "DEPT", description: "DEPT" },
  { name: "CLASS", description: "CLASS" },
  { name: "STYLE", description: "STYLE" },
];


export default function App() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedElement, setSelectedElement] = useState(null);

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

  // listens to the key delete to remove the selected element
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedElement) {
        const newElements = canvasElements.filter(
          (element) => element.id !== selectedElement.id
        );
        setCanvasElements(newElements);
        setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown)
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    } 
  }, [selectedElement]);

  const [selectedColor, setSelectedColor] = useState("#ffffff");

  function handleColorChange(newColor) {
    setSelectedColor(newColor);
  }

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY_LIST[0].value);

  // we must load images from database to this state
  const [imageList, setImageList] = useState([
    { url: "https://picsum.photos/200/300?id=1" },
    { url: "https://picsum.photos/200/300?id=2" },
    { url: "https://picsum.photos/200/300?id=3" },
    { url: "https://picsum.photos/200/300?id=4" },
    { url: "https://picsum.photos/200/300?id=5" },
    { url: "https://picsum.photos/200/300?id=6" },
    { url: "https://picsum.photos/200/300?id=7" },
    { url: "https://picsum.photos/200/300?id=8" },
    { url: "https://picsum.photos/200/300?id=9" },
    { url: "https://picsum.photos/200/300?id=0" },
    { url: "https://picsum.photos/200/300?id=11" },
    { url: "https://picsum.photos/200/300?id=12" },
    { url: "https://picsum.photos/200/300?id=13" },
  ]);

  // we must load images from database to this state
  const [barcodeImageList, setBarcodeImageList] = useState([
    { url: "https://cdn-dfhjh.nitrocdn.com/BzQnABYFnLkAUVnIDRwDtFjmHEaLtdtL/assets/images/optimized/rev-c133d21/wp-content/uploads/2015/02/barcode-3.png" },
    { url: "https://propelapps.com/wp-content/uploads/2020/03/Barcode-Scan-e1551864357220.png" },
  ]);

  // CANVAS ELEMENTS, please add all elements you want to render in the canvas
  // I added a text element as an example
  const [canvasElements, setCanvasElements] = useState([
    {
      id: "1",
      type: "text",
      draggable: true,
      state: {
        isDragging: false,
        x: 10,
        y: 50,
        text: "Draggable Text",
        fontFamily: "Roboto",
        fontSize: 20,
      },
    },
    {
      id: "2",
      type: "text",
      draggable: false,
      state: {
        isDragging: false,
        x: 200,
        y: 50,
        text: "Not Draggable Text 2",
        fontFamily: "Verdana",
        fontSize: 40,
      },
    },
    {
      id: "4",
      type: "image",
      draggable: true,
      state: {
        isDragging: false,
        x: 200,
        y: 200,
        width: 300,
        height: 250,
        url: "https://cdn130.picsart.com/280172553005211.png",
      },
    },
    {
      id: "5",
      type: "image",
      draggable: true,
      isDynamic: true,
      state: {
        isDragging: false,
        x: 500,
        y: 600,
        width: 300,
        height: 100,
        url: "https://propelapps.com/wp-content/uploads/2020/03/Barcode-Scan-e1551864357220.png",
      },
    }
  ]);

  // refreshes the selected element when the canvas elements change
  useEffect(() => {
    if (selectedElement) {
      const element = canvasElements.find(
        (element) => element.id === selectedElement.id
      );
      setSelectedElement(element);
    }
  }, [selectedElement, canvasElements]);

  // This function is called when the user changes the size of an element
  // updates the width and height of the element or any other element attributes
  const onChange = (element, stateAttrs, mainAttrs = {}) => {
    if (element) {
      setCanvasElements((prevState) => {
        const index = prevState.findIndex(
          (item) => item.id === element.id
        );
        const newElements = [...prevState];
        newElements[index] = {
          ...newElements[index],
          ...mainAttrs,
          state: {
            ...newElements[index].state,
            ...stateAttrs,
          },
        };
        return newElements;
      });
    }
  }

  // This function is called when the user starts dragging an element
  // sets the element state to isDragging = true
  const onDragStart = (element) => {
    onChange(element, {
      isDragging: true,
    });
  }

  // This function is called when the user stops dragging an element
  // sets the element state to isDragging = false and updates the x and y coordinates
  const onDragEnd = (e, element) => {
    onChange(element, {
      isDragging: false,
      x: e.target.x(),
      y: e.target.y(),
    });
  }

  // This function is called when the user clicks on an element
  // sets the selectedElement state to the element that was clicked
  const onSelect = (element) => {
    setSelectedElement(element);
  }

  // This function is called to render the canvas elements
  const getCanvasElement = (element) => {
    if (element.type === "text") {
      return (
        <Text
          text={element.state.text}
          x={element.state.x}
          y={element.state.y}
          fontFamily={element.state.fontFamily}
          fontSize={element.state.fontSize}
          draggable={element.draggable}
          fill={element.state.isDragging ? "green" : "black"}
          onDragStart={() => onDragStart(element)}
          onDragEnd={(e) => onDragEnd(e, element)}
        />
      )
    }
    if (element.type === "image") {
      return (
        <LoadImage
          id={element.id}
          url={element.state.url}
          x={element.state.x}
          y={element.state.y}
          width={element.state.width}
          height={element.state.height}
          draggable={element.draggable}
          onDragStart={() => onDragStart(element)}
          onDragEnd={(e) => onDragEnd(e, element)}
          isSelected={selectedElement && selectedElement.id === element.id}
          onSelect={() => onSelect(element)}
          onChange={(newAttrs) => onChange(element, newAttrs)}
        />
      )
    }
    return <></>;
  }

  // deselect when clicked on empty area
  const handleDeselectElement = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement(null);
    }
  };

  const handleDynamicElement = (element, checked) => {
    onChange(element, {}, {
      isDynamic: checked,
    });
  }

  return (
    <div className="mx-auto p-0 lg:px-1 mt-1">
      <div className="grid grid-cols-12">
        <div className="md:col-span-4">
          <SidePanel
            onColorChange={handleColorChange}
            setFontFamily={setFontFamily}
            imageList={imageList}
            setImageList={setImageList}
            barcodeImageList={barcodeImageList}
            setBarcodeImageList={setBarcodeImageList}
            setCanvasElements={setCanvasElements}
            fields = {fields}
          />
        </div>
        <div className="col-span-12 md:col-span-8">
          <ToolbarLabel 
            selectedElement={selectedElement}
            handleDynamicElement={handleDynamicElement}
          />
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
              onMouseDown={handleDeselectElement}
              onTouchStart={handleDeselectElement}
              ref={stageRef}
              
            >
              <Layer>
                <Background
                  width={dimensions.width}
                  height={dimensions.height}
                  color={selectedColor}
                />
                {/* Esto es solo un ejemplo de drag and drop*/}
                {canvasElements.map((element) => (
                  <Fragment key={element.id}>
                    {getCanvasElement(element)}
                  </Fragment>
                ))}
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