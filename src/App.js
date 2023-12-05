import { React, Fragment, useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text, Transformer } from 'react-konva';
import ToolbarLabel from './components/toolbar-label';
import SidePanel from './components/side-panel';
import { LoadImage } from './components/image-editor';
import { LoadText } from './components/text-editor';
import { LoadField } from './components/fields-editor';
import { inchesToPixels, centimetersToPixels } from './components/sizelabel-editor';
import jsPDF from 'jspdf';
import { ZoomOutIcon, ZoomInIcon, RefreshIcon } from '@heroicons/react/outline';
import { generatePHP } from './tools/generator';
import {
  TransformWrapper,
  TransformComponent,
  useControls
} from "react-zoom-pan-pinch";

const captureCanvas = (stageRef) => {
  const canvas = stageRef.current.toCanvas();
  const dataURL = canvas.toDataURL();
  return dataURL;
};

const defaultCanvasWidth = 3;
const defaultCanvasHeight = 5;
const defaultCanvasWidthPx = defaultCanvasWidth * inchesToPixels;
const defaultCanvasHeightPx = defaultCanvasHeight * inchesToPixels;
const defaultCanvasColor = {
  hex: '#ffffff',
  rgb: { r: 255, g: 255, b: 255, a: 1 }
}
const defaultCanvasRotation = 0;
const defaultCanvasMetric = 'in';
const defaultCanvasZoom = 1;

export default function App() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const isCtrlPressed = useRef(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedColor, setSelectedColor] = useState(defaultCanvasColor);
  const [width, setWidth] = useState(defaultCanvasWidth);
  const [currentElementWidth, setCurrentElementWidth] = useState(0);
  const [height, setHeight] = useState(defaultCanvasHeight);
  const [selectedMetric, setSelectedMetric] = useState(defaultCanvasMetric);
  const [selectedRotation, setSelectedRotation] = useState(defaultCanvasRotation);
  const [selectedW, setSelectedW] = useState(defaultCanvasWidthPx);
  const [selectedH, setSelectedH] = useState(defaultCanvasHeightPx);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [zoom, setZoom] = useState(defaultCanvasZoom);
  // Export options, needed to deselect elements before exporting
  const [exportType, setExportType] = useState(null);
  const [exportName, setExportName] = useState(null);
  const [exportReady, setExportReady] = useState(false);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [fontFamilyList, setFontFamilyList] = useState([]);
  const [align, setAlign] = useState("none");
  const [position, setPosition] = useState("none");
  // maximum amount of elements to store in the undo stack
  const maxHistoryStackLength = 10;

  // CANVAS ELEMENTS, please add all elements you want to render in the canvas
  // I added a text element as an example
  const [canvasElements, setCanvasElements] = useState([]);
  const [guideLines, setGuideLines] = useState({ vertical: null, horizontal: null });
  const [showGuides, setShowGuides] = useState(false);
  const [lineEnds, setLineEnds] = useState({ endX: null, endY: null });
  const [selectedElements, setSelectedElements] = useState([]);

  const handleDragMove = (e) => {
    const shape = e.target;
    const layer = shape.getLayer();
   
    const shapes = layer.find((node) => {
      // Incluir nodos 'Group' y nodos de texto independientes que no están dentro de un grupo
      return (node.getClassName() === 'Group') || (node.getClassName() === 'Text' && !node.findAncestors('Group').length);
    });
    
    setShowGuides(true);
    let lineGuideX = null;
    let lineGuideY = null;
    let lineEndX = null;
    let lineEndY = null;

    shapes.forEach((guideShape) => {
      if (guideShape === shape) {
        return;
      }

      // Calculate the center of the dragged image
      const draggedCenterX = shape.x() + shape.width() / 2;
      const draggedCenterY = shape.y() + shape.height() / 2;

      // Calculate the center of the guide image
      const guideCenterX = guideShape.x() + guideShape.width() / 2;
      const guideCenterY = guideShape.y() + guideShape.height() / 2;

      if (Math.abs(draggedCenterX - guideCenterX) < 5) {
        lineGuideX = guideCenterX;
      }

      if (Math.abs(draggedCenterY - guideCenterY) < 5) {
        lineGuideY = guideCenterY;
      }

      // Calculate the ends of the guide image
      const guideLeftX = guideShape.x();
      const guideTopY = guideShape.y();
      const guideRightX = guideShape.x() + guideShape.width();
      const guideBottomY = guideShape.y() + guideShape.height();

      const shapeLeftX = shape.x();
      const shapeTopY = shape.y();

      if (Math.abs(shapeLeftX - guideRightX) < 5) {
        lineEndX = guideRightX;
      }

      if (Math.abs(shapeTopY - guideBottomY) < 5) {
        lineEndY = guideBottomY;
      }

      if (Math.abs(shape.x() - guideLeftX) < 5) {
        lineEndX = guideLeftX;
      }

      if (Math.abs(shape.y() - guideTopY) < 5) {
        lineEndY = guideTopY;
      }

      if (Math.abs(shape.x() + shape.width() - guideRightX) < 5) {
        lineEndX = guideRightX;
      }

      if (Math.abs(shape.y() + shape.height() - guideBottomY) < 5) {
        lineEndY = guideBottomY;
      }

      if (Math.abs(shape.x() + shape.width() - guideLeftX) < 5) {
        lineEndX = guideLeftX;
      }

      if (Math.abs(shape.y() + shape.height() - guideTopY) < 5) {
        lineEndY = guideTopY;
      }
    });

    setGuideLines({ vertical: lineGuideX, horizontal: lineGuideY });
    setLineEnds({ endX: lineEndX, endY: lineEndY });
  
    shape.position({
      x: lineGuideX !== null ? lineGuideX - shape.width()  / 2 : shape.x(),
      y: lineGuideY !== null ? lineGuideY - shape.height() / 2 : shape.y(),
    });

    stageRef.current.batchDraw();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !isCtrlPressed.current) {

        isCtrlPressed.current = true;
      }
    };

    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        isCtrlPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);



  const handleDragEnd = () => {
    setShowGuides(false);
    setGuideLines({ vertical: null, horizontal: null });
  };


  const applyTemplate = (template) => {
    setWidth(template.design.format.width);
    setHeight(template.design.format.height);
    setSelectedW(template.design.format.widthPx);
    setSelectedH(template.design.format.heightPx);
    setSelectedRotation(template.design.format.angle);
    setSelectedMetric(template.design.format.metric);
    handleCanvasElementsChange(template.design.elements);
  };

  const handleCaptureClick = () => {
    const imageDataURL = captureCanvas(stageRef);
    return imageDataURL// Aquí puedes hacer lo que quieras con la imagen en base64, como guardarla o mostrarla en el navegador
  };

  useEffect(() => {
    if (selectedTemplate) {
      setZoom(1);
      setSelectedW(defaultCanvasWidthPx);
      setSelectedH(defaultCanvasHeightPx);
      applyTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  }, [selectedTemplate]);

  // listens to the key delete to remove the selected element
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedElement?.type !== 'Checkbox')
        deleteElementSelected();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, selectedElements]);

  const handleColorChange = (newColor) => {
    setSelectedColor(newColor);
  }

  const handleChangeW = (newWidth) => {
    setSelectedW(newWidth * zoom);
    if (selectedMetric === 'in') {
      setWidth(newWidth / inchesToPixels);
    }
    if (selectedMetric === 'cm') {
      setWidth(newWidth / centimetersToPixels);
    }
  }

  const handleChangeH = (newHeight) => {
    setSelectedH(newHeight * zoom);
    if (selectedMetric === 'in') {
      setHeight(newHeight / inchesToPixels);
    }
    if (selectedMetric === 'cm') {
      setHeight(newHeight / centimetersToPixels);
    }
  }

  const handleChangeRotation = (newRotation) => {
    setSelectedRotation(newRotation);
  }

  const fetchFontFamily = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/fonts`);
      const fontFamilyData = await response.json();
      if (response.ok) {
        setFontFamilyList(fontFamilyData);
      } else {
        const message = `Notifications: ${fontFamilyData.message}`;
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error fontFamily data:', error);
    }
  };

  useEffect(() => {
    fetchFontFamily();
  }, []);

  const [fontFamily, setFontFamily] = useState(fontFamilyList[0]?.name);
  const [fontSize, setFontSize] = useState(24);

  // we must load images from database to this state or local storage
  const [imageList, setImageList] = useState([]);

  const [selectedOption, setSelectedOption] = useState('Download as');

  const handleExportClick = (type, name) => {
    setSelectedElement(null);
    setExportType(type);
    setExportName(name);
    setExportReady(true);
  };

  useEffect(() => {
    if (exportReady) {
      const isMobile = window.innerWidth <= 768;

      const fileNameValidator = /^[\w\-. ]+$/gm;
      let formatName = 'newlabel';

      if (exportName && fileNameValidator.test(exportName)) {
        formatName = exportName;
      }

      setSelectedOption('Download as');
      if (exportType === 'pdf') {
        const stageEx = stageRef.current;
        const dataURL = stageEx.toDataURL({
          pixelRatio: window.devicePixelRatio,
          mimeType: 'image/png',
          quality: 1,
        });
        const isLandscape = stageEx.width() > stageEx.height();
        const doc = new jsPDF((isLandscape) ? 'l' : 'p', 'px', [
          stageEx.width(),
          stageEx.height(),
        ]);

        if (isMobile) {
          const mobileWidth = 300;
          const mobileHeight = 400;
          const scaleFactor = Math.min(
            mobileWidth / stageEx.width(),
            mobileHeight / stageEx.height()
          );
          const scaledWidth = stageEx.width() * scaleFactor;
          const scaledHeight = stageEx.height() * scaleFactor;

          doc.addImage(dataURL, 'PNG', 0, 0, scaledWidth, scaledHeight);
        } else {
          doc.addImage(dataURL, 'PNG', 0, 0, stageEx.width(), stageEx.height());
        }

        doc.save(`${formatName}.pdf`);
      } else if (exportType === "php") {
        const phpString = generatePHP(canvasElements, {
          width: Math.floor((selectedMetric === 'in') ? width * inchesToPixels : width * centimetersToPixels),
          height: Math.floor((selectedMetric === 'in') ? height * inchesToPixels : height * centimetersToPixels),
          realWidth: width,
          realHeight: height,
          color: {
            r: selectedColor.rgb.r,
            g: selectedColor.rgb.g,
            b: selectedColor.rgb.b,
          },
          angle: selectedRotation,
        });
        if (phpString) {
          const link = document.createElement('a');
          link.download = `${formatName}.php`;
          link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(phpString);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        const mimeType = exportType === 'png' ? 'image/png' : 'image/jpeg';
        const extension = exportType === 'png' ? 'png' : 'jpg';

        const stageEx = stageRef.current;
        const dataURL = stageEx.toDataURL({
          pixelRatio: window.devicePixelRatio,
          mimeType: mimeType,
          quality: 1,
        });

        const link = document.createElement('a');
        link.download = `${formatName}.${extension}`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setExportReady(false);
      setExportType(null);
      setExportName(null);
    }
  }, [exportReady]);
  
  // refreshes the selected element when the canvas elements change
  useEffect(() => {
    if (selectedElement) {
      const element = canvasElements.find(
        (element) => element.id === selectedElement.id
      );
      setSelectedElement(element);
    }
    if (selectedElements) {
      const elements = selectedElements.map((selected) => {
        const element = canvasElements.find(
          (element) => element.id === selected.id
        );
        return element;
      });
      setSelectedElements(elements);
    }
  }, [ selectedElement, canvasElements]);

  // This function is called when the user changes an element
  // updates the attributes of the element or any other element attributes
  // or creates a new one if it doesn't exist
  const onChange = (element, stateAttrs = {}, mainAttrs = {}) => {
    if (element) {
      const index = canvasElements.findIndex((item) => item.id === element.id);
      const newElements = [...canvasElements];
      if (index === -1) {
        newElements.push(element);
      } else {
        newElements[index] = {
          ...newElements[index],
          ...mainAttrs,
          state: {
            ...newElements[index].state,
            ...stateAttrs,
          },
        };
      }
      handleCanvasElementsChange(newElements);
    }
  };




  // this functions is called when the user wants to delete an element
  // removes the element from the canvasElements array
  const onDelete = (element) => {
    const elementsToDelete = Array.isArray(element) ? element : [element];
    const newElements = canvasElements.filter((canvasElement) => !elementsToDelete.some((item) => item.id === canvasElement.id));
    handleCanvasElementsChange(newElements);
  }



  // This function is called when the user clicks on an element
  // sets the selectedElement state to the element that was clicked
  const onSelect = (element) => {
    if (isCtrlPressed.current) {
      setSelectedElements((prevSelected) => {
        prevSelected = prevSelected || [];

        if (prevSelected.some((selected) => selected.id === element.id)) {
          return prevSelected.filter((el) => el.id !== element.id);
        } else {
          return [...prevSelected, element];
        }
      });
      setSelectedElement(null);
    } else {
      setSelectedElement(element);
      setSelectedElements(null);
    }
  };





  // deletes the selected element
  const deleteElementSelected = () => {
    if (selectedElements) {
      setSelectedElements(null);
      onDelete(selectedElements);
    }
    else if (selectedElement) {
      setSelectedElement(null);
      onDelete(selectedElement);
    }
  };

  // This function is called to render the canvas elements
  const getCanvasElement = (element) => {
    const { type, draggable, ...rest } = element;
    const isSelected = (selectedElements && selectedElements?.some((selected) => selected.id === element.id)) || selectedElement?.id === element.id;

    const commonProps = {
      draggable,
      onDragMove: rest.onDragMove,
      onDragEnd: rest.onDragEnd,
      isSelected: isSelected,
      onChange: (newAttrs) => onChange(element, newAttrs),
      onSelect: () => {
        onSelect(element || []);
      }
    };

    if (type === 'text') {
      return (
        <LoadText
          id={element.id}
          text={element.state.text}
          x={element.state.x}
          y={element.state.y}
          width={element.state.width}
          fontFamily={element.state.fontFamily}
          fontSize={element.state.fontSize}
          fill={element.state.fill}
          align={element.state.align}
          setCurrentElementWidth={setCurrentElementWidth}
          {...commonProps}
        />
      );
    }
    if (type === 'Checkbox') {
      return (
        <LoadField
          id={element.id}
          text={element.state.text}
          x={element.state.x}
          y={element.state.y}
          fontFamily={element.state.fontFamily}
          fontSize={element.state.fontSize}
          fill={element.state.fill}
          align={element.state.align}
          setCurrentElementWidth={setCurrentElementWidth}
          position={position}
          {...commonProps}
        />
      );
    }
    if (type === 'image' || type === 'barcode') {
      const isBarcode = type === 'barcode';
      return (
        <LoadImage
          id={element.id}
          url={element.state.url}
          x={element.state.x}
          y={element.state.y}
          width={element.state.width}
          height={element.state.height}
          isBarcode={isBarcode}
          barcodeValue={isBarcode ? element.barcodeValue : 0}
          barcodeType={isBarcode ? element.barcodeType : ""}
          barcodeDisplayValue={isBarcode ? element.barcodeDisplayValue : false}
          setCurrentElementWidth={setCurrentElementWidth}
          {...commonProps}
        />
      );
    }
    return <></>;
  };

  // deselect when clicked on empty area
  const handleDeselectElement = (e) => {
    const clickedOnEmpty = e.target?.attrs?.id === 'background';
    const clickedOnGrayArea = e.target?.id === 'grayArea';
    if (clickedOnEmpty || clickedOnGrayArea) {
      setSelectedElements(null);
      setSelectedElement(null);
    }
  };

  // undo and re do functions
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousElements = undoStack.slice(0, -1);
      const lastCanvasElements = undoStack.slice(-1)[0];
      const lastPreviousElement = previousElements.slice(-1)[0] ?? null;
      setUndoStack(previousElements);
      setRedoStack((prevStack) => [lastCanvasElements, ...prevStack]);
      if (lastPreviousElement) {
        setZoom(lastPreviousElement.window.zoom);
        setSelectedW(lastPreviousElement.window.selectedW);
        setSelectedH(lastPreviousElement.window.selectedH);
        setCanvasElements(lastPreviousElement.elements);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextElement = redoStack[0];
      const updatedRedoStack = redoStack.slice(1);
      setRedoStack(updatedRedoStack);
      setUndoStack((prevStack) => [...prevStack, {
        window: { zoom, selectedW, selectedH },
        elements: canvasElements
      }]);
      if (nextElement) {
        setZoom(nextElement.window.zoom);
        setSelectedW(nextElement.window.selectedW);
        setSelectedH(nextElement.window.selectedH);
        setCanvasElements(nextElement.elements);
      }
    }
  };

  const handleCanvasElementsChange = (newElements, extraParams = null) => {

    setCanvasElements(newElements);
    setUndoStack((prevStack) => [...prevStack, {
      window: (extraParams) ? extraParams : { zoom, selectedW, selectedH },
      elements: newElements
    }].slice(-maxHistoryStackLength));
    setRedoStack([]);
  };

  useEffect(() => {
    const containerElement = document.getElementById("grayArea");
    if (containerElement) {
      setContainerWidth(containerElement.clientWidth);
      setContainerHeight(containerElement.clientHeight);
    }
  }, []);

  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const pixelsPerInch = inchesToPixels; // Pixeles por pulgada
  const inchHeight = 25; // Altura de las divisiones de pulgada
  const halfHeight = 20; // Altura de las divisiones de 1/2 pulgada
  const quarterHeight = 15; // Altura de las divisiones de 1/4 pulgada
  const eighthHeight = 10; // Altura de las divisiones de 1/8 pulgada
  const sixteenthHeight = 5; // Altura de las divisiones de 1/16 pulgada
  const inches = 12; // Longitud total en pulgadas

  const numDivisions = inches * 16;

  const horizontalLines = [];
  const horizontalTexts = [];
  const verticalLines = [];
  const verticalTexts = [];

  for (let i = 0; i <= numDivisions; i++) {
    const xPos = (i * ((pixelsPerInch / 16) * zoom)) + 47;
    const yPos = (i * ((pixelsPerInch / 16) * zoom)) + 40;
    const isLargeDivision = i % 16 === 0;
    const isHalfDivision = i % 8 === 0 && !isLargeDivision;
    const isQuarterDivision = i % 4 === 0 && !isHalfDivision;
    const isEighthDivision = i % 2 === 0 && !isQuarterDivision;
    const isSixteenthDivision = !isLargeDivision && !isHalfDivision && !isQuarterDivision && !isEighthDivision;

    let divisionHeight = 0;
    let positionPivot = 0;

    if (isLargeDivision) {
      divisionHeight = inchHeight + 15;
      positionPivot = 15;
    }
    else if (isHalfDivision) {
      divisionHeight = halfHeight + 20;
      positionPivot = 20;
    }
    else if (isQuarterDivision) {
      divisionHeight = quarterHeight + 25;
      positionPivot = 25;
    }
    else if (isEighthDivision) {
      divisionHeight = eighthHeight + 30;
      positionPivot = 30;
    }
    else if (isSixteenthDivision) {
      divisionHeight = sixteenthHeight + 35;
      positionPivot = 35;
    }

    horizontalLines.push(
      <Line
        key={`hline-${i}`}
        points={[xPos, positionPivot, xPos, divisionHeight]}
        stroke="black"
        strokeWidth={isLargeDivision ? 2 : 1.5}
      />
    );

    verticalLines.push(
      <Line
        key={`vline-${i}`}
        points={[positionPivot + 7, yPos, divisionHeight + 7, yPos]}
        stroke="black"
        strokeWidth={isLargeDivision ? 2 : 1.5}
      />
    );

    if (isLargeDivision || isHalfDivision) {
      const inchValue = i / 16 > 0 ? `${i / 16}"` : '';
      horizontalTexts.push(
        <Text
          key={`htext-${i}`}
          x={xPos - 3}
          y={5}
          text={inchValue}
          fontSize={10}
        />
      );

      verticalTexts.push(
        <Text
          key={`vtext-${i}`}
          x={5}
          y={yPos - 5}
          text={inchValue}
          fontSize={10}
        />
      );
    }
  }

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
      <div  style={{
        position: 'absolute',
        left: '70%',
        bottom: '5%',
        transform: 'translateX(-50%)'
      }}>
        <button className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10" onClick={() => zoomOut()}> <ZoomOutIcon className="h-5 w-5" aria-hidden="true" /></button>
        <button className="relative inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10" onClick={() => resetTransform()}> <RefreshIcon className="h-5 w-5" aria-hidden="true" /></button>
        <button className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10" onClick={() => zoomIn()}><ZoomInIcon className="h-5 w-5" aria-hidden="true" /></button>
      </div>
    );
  };

  return (
    <div className="mx-auto p-0 lg:px-1 mt-1">
      <div className="grid grid-cols-12">
        <div className="md:col-span-4">
          <SidePanel
            onColorChange={handleColorChange}
            onChangeW={handleChangeW}
            onChangeH={handleChangeH}
            onChangeRotation={handleChangeRotation}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontFamilyList={fontFamilyList}
            fontSize={fontSize}
            setFontSize={setFontSize}
            imageList={imageList}
            setImageList={setImageList}
            canvasElements={canvasElements}
            selectedElement={selectedElement}
            onSelect={onSelect}
            getCanvasElement={getCanvasElement}
            onChange={onChange}
            onDelete={onDelete}
            setSelectedTemplate={setSelectedTemplate}
            handleCaptureClick={handleCaptureClick}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            fetchFontFamily={fetchFontFamily}
            align={align}
            width={width}
            position={position}
            setPosition={setPosition}

            format={{
              widthPx: selectedW,
              heightPx: selectedH,
              width: width,
              height: height,
              metric: selectedMetric,
              angle: selectedRotation
            }}
          />
        </div>
        <div className="col-span-12 md:col-span-8">
          <ToolbarLabel
            selectedElements={selectedElements}
            selectedElement={selectedElement}
            deleteElementSelected={deleteElementSelected}
            handleExportClick={handleExportClick}
            selectedOption={selectedOption}
            undoStackLength={undoStack.length}
            redoStackLength={redoStack.length}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            canvasElements={canvasElements}
            onChange={onChange}
            fontFamilyList={fontFamilyList}
            width={width}
            height={height}
            selectedMetric={selectedMetric}
            currentElementWidth={currentElementWidth}
            setAlign={setAlign}
            position={position}
            setPosition={setPosition}
            handleCanvasElementsChange={handleCanvasElementsChange}
          />
          {/* A partir de aqui Canvas*/}
          <TransformWrapper
            panning={{ activationKeys: ["Shift"] }}
            wheel={{ activationKeys: ["Shift"] }}
          >
          <TransformComponent
          >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: 'absolute',
              overflowY: 'auto'
            }}
          >
            <Stage
              width={containerWidth}
              height={containerHeight}
            >
              <Layer>
                {horizontalTexts}
                {horizontalLines}
              </Layer>
              <Layer>
                {verticalTexts}
                {verticalLines}
              </Layer>
            </Stage>
          </div>
          <div
            style={{
              width: '135vh',
              height: '100vh',
              backgroundColor: '#CDCBCB'
            }}
            onMouseDown={handleDeselectElement}
            onTouchStart={handleDeselectElement}
            id="grayArea"
          >
            <div
              className="containerCanvas"
              ref={containerRef}
              style={{
                width: `${selectedW}px`,
                height: `${selectedH}px`,
                marginLeft: '47px',
                marginTop: '40px',
              }}
            >
              <Stage
                width={selectedW}
                height={selectedH}
                onMouseDown={handleDeselectElement}
                onTouchStart={handleDeselectElement}
                ref={stageRef}
              >
                <Layer>
                  {/* Fondo */}
                  <Rect
                    width={selectedW}
                    height={selectedH}
                    fill={selectedColor.hex}
                    id="background"
                  />

                  {/* Elementos arrastrables */}
                  {canvasElements.map((element) => (
                    <Fragment key={element.id}>
                      {getCanvasElement({
                        ...element,
                        draggable: true,
                        onDragMove: handleDragMove,
                        onDragEnd: handleDragEnd,
                      })}
                    </Fragment>
                  ))}

                  {showGuides && (
                    <>
                      {guideLines.horizontal !== null && (
                        <Line
                          points={[0, guideLines.horizontal, selectedW, guideLines.horizontal]}
                          stroke="rgb(0, 161, 255)"
                          strokeWidth={1}
                          dash={[4, 6]}
                        />
                      )}
                      {guideLines.vertical !== null && (
                        <Line
                          points={[guideLines.vertical, 0, guideLines.vertical, selectedH]}
                          stroke="rgb(0, 161, 255)"
                          strokeWidth={1}
                          dash={[4, 6]}
                        />
                      )}
                      {lineEnds.endX !== null && (
                        <Line
                          points={[lineEnds.endX, 0, lineEnds.endX, selectedH]}
                          stroke="rgb(0, 161, 255)"
                          strokeWidth={1}
                          dash={[4, 6]}
                        />
                      )}
                      {lineEnds.endY !== null && (
                        <Line
                          points={[0, lineEnds.endY, selectedW, lineEnds.endY]}
                          stroke="rgb(0, 161, 255)"
                          strokeWidth={1}
                          dash={[4, 6]}
                        />
                      )}
                    </>
                  )}
                </Layer>
              </Stage>
      
            </div>
          </div>
            </TransformComponent>
            <Controls />
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
}
