import { React, Fragment, useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import ToolbarLabel from './components/toolbar-label';
import SidePanel from './components/side-panel';
import { LoadImage } from './components/image-editor';
import { LoadText } from './components/text-editor';
import { LoadField } from './components/fields-editor';
import { inchesToPixels, centimetersToPixels } from './components/sizelabel-editor';
import jsPDF from 'jspdf';
import { ZoomOutIcon, ZoomInIcon } from '@heroicons/react/outline';
import { generatePHP } from './tools/generator';

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
  // maximum amount of elements to store in the undo stack
  const maxHistoryStackLength = 10;

  // CANVAS ELEMENTS, please add all elements you want to render in the canvas
  // I added a text element as an example
  const [canvasElements, setCanvasElements] = useState([]);

  const [guideLines, setGuideLines] = useState({ vertical: null, horizontal: null });
  const [showGuides, setShowGuides] = useState(false);
  const [lineEnds, setLineEnds] = useState({ endX: null, endY: null });
 
  const handleDragMove = (e) => {
    const shape = e.target;
    const layer = shape.getLayer();
    const shapes = layer.find(node => node.getClassName() === 'Image' || node.getClassName() === 'Text');
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
  
        if (Math.abs(draggedCenterX - guideCenterX) < 5 ) {
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

        if (Math.abs(shape.x() + shape.width() - guideRightX) < 5 ) {
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
        x: lineGuideX !== null ? lineGuideX - shape.width() / 2 : shape.x(),
        y: lineGuideY !== null ? lineGuideY - shape.height() / 2 : shape.y(),
    });
  
    stageRef.current.batchDraw();
};


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
      if (event.key === 'Delete' && selectedElement?.type !== 'text' && selectedElement?.type !== 'Checkbox')
        deleteElementSelected();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement]);

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

  // zooms in the canvas and all elements in it
  const handleZoomUp = () => {
    if (zoom < 2) {
      setZoom(zoom + 0.1);
      setSelectedW(selectedW * 1.1);
      setSelectedH(selectedH * 1.1);
      const newElements = canvasElements.map((element) => {
        const fontAttrs = element.type === 'text' ? { fontSize: element.state.fontSize * 1.1 } : {};
        return {
          ...element,
          state: {
            ...element.state,
            x: element.state.x * 1.1,
            y: element.state.y * 1.1,
            width: element.state.width * 1.1,
            height: element.state.height * 1.1,
            ...fontAttrs,
          },
        };
      }
      );
      handleCanvasElementsChange(newElements, {
        selectedW: selectedW * 1.1,
        selectedH: selectedH * 1.1,
        zoom: zoom + 0.1,
      });
    }
  }

  // zooms out the canvas and all elements in it
  const handleZoomDown = () => {
    if (zoom > 1) {
      setZoom(zoom - 0.1);
      setSelectedW(selectedW * 0.9);
      setSelectedH(selectedH * 0.9);
      const newElements = canvasElements.map((element) => {
        const fontAttrs = element.type === 'text' ? { fontSize: element.state.fontSize * 0.9 } : {};
        return {
          ...element,
          state: {
            ...element.state,
            x: element.state.x * 0.9,
            y: element.state.y * 0.9,
            width: element.state.width * 0.9,
            height: element.state.height * 0.9,
            ...fontAttrs,
          },
        };
      }
      );
      handleCanvasElementsChange(newElements, {
        selectedW: selectedW * 0.9,
        selectedH: selectedH * 0.9,
        zoom: zoom - 0.1
      });
    }
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
  const [fontSize, setFontSize] = useState(48);

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
        const doc = new jsPDF((isLandscape) ? 'l': 'p', 'px', [
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
          width:  Math.floor((selectedMetric === 'in') ? width  * inchesToPixels : width  * centimetersToPixels),
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
  }, [selectedElement, canvasElements]);

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
    const newElements = canvasElements.filter(
      (item) => item.id !== element.id
    );
    handleCanvasElementsChange(newElements);
  }

  // This function is called when the user clicks on an element
  // sets the selectedElement state to the element that was clicked
  const onSelect = (element) => {
    setSelectedElement(element);
  };

  // deletes the selected element
  const deleteElementSelected = () => {
    if (selectedElement) {
      setSelectedElement(null);
      onDelete(selectedElement);
    }
  };
  
  // This function is called to render the canvas elements
  const getCanvasElement = (element) => {
    const { type, draggable, ...rest } = element;
    const commonProps = {
      draggable,
      onDragMove: rest.onDragMove,
      onDragEnd: rest.onDragEnd,   
      isSelected: selectedElement && selectedElement.id === element.id,
      onSelect: () => onSelect(element),
      onChange: (newAttrs) => onChange(element, newAttrs),
    };
  
    if (type === 'text') {
      return (
        <LoadText
          id={element.id}
          text={element.state.text}
          x={element.state.x}
          y={element.state.y}
          fontFamily={element.state.fontFamily}
          fontSize={element.state.fontSize}
          fill={element.state.fill}
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
          setCurrentElementWidth={setCurrentElementWidth}
          {...commonProps}
        />
      );
    }
    if (type === 'image' || type === 'barcode') {
      return (
        <LoadImage
          id={element.id}
          url={element.state.url}
          x={element.state.x}
          y={element.state.y}
          width={element.state.width}
          height={element.state.height}
          isBarcode={type === 'barcode'}
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
            selectedMetric={selectedMetric}
            currentElementWidth={currentElementWidth}
          />
          {/* A partir de aqui Canvas*/}
          <div
            style={{
              width: '100%',
              height: '80vh',
              backgroundColor: '#CDCBCB',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'scroll'
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
                margin: '5px',
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
                        {guideLines.horizontal  !== null && (
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
          {/* A partir de aqui Zoom*/}
          <div className="flex justify-center z-10 -mt-20 md:-mt-11">
            <span className="isolate inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={handleZoomDown}
                className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10"
              >
                <ZoomOutIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10">
                { Math.floor(100 * zoom) }%
              </span>
              <button
                type="button"
                onClick={handleZoomUp}
                className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-300 focus:z-10"
              >
                <ZoomInIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
