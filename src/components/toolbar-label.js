import { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import { FONT_SIZE_LIST, SizeMenu, FontFamilyMenu } from './text-editor';
import { SketchPicker } from "react-color";
import Konva from 'konva';
import {
  TrashIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
} from '@heroicons/react/outline';
import { inchesToPixels, centimetersToPixels } from './sizelabel-editor';
import LeftAlignmentIcon from '../svg/align-left.svg';
import CenterAlignmentIcon from '../svg/align-center.svg';
import RightAlignmentIcon from '../svg/align-right.svg';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const getUpdatedElementAttrs = (elements, id, property, value) => {
  const element = elements.find((element) => element.id === id);
  const stateAttrs = Array.isArray(property) > 0
    ? property.reduce((acc, curr, index) => {
      acc[curr] = value[index];
      return acc;
    }, {})
    : { [property]: value };
  return { element, stateAttrs };
}

export default function ToolbarLabel({
  selectedElement,
  selectedElements,
  deleteElementSelected,
  handleExportClick,
  selectedOption,
  undoStackLength,
  redoStackLength,
  handleUndo,
  handleRedo,
  onChange,
  canvasElements,
  fontFamilyList,
  width,
  selectedMetric,
  setAlign,
  position,
  setPosition,
  handleCanvasElementsChange
}) {

  const [formatName, setFormatName] = useState('newlabel');
  const [fade, setFade] = useState(false);
  const [defaultFontSize, setDefaultFontSize] = useState(0);
  const [defaultFontFamily, setDefaultFontFamily] = useState('Arial');
  const [defaultText, setDefaultText] = useState('');
  const [defaultColor, setDefaultColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);
  const [layer, setLayer] = useState(null);

  const isSelectedTextElement = !!selectedElement && (selectedElement?.type === 'text' || selectedElement?.type === 'Checkbox');

  const allFonts = [...fontFamilyList, ...customFonts];

  const isSelectedElemet = selectedElement !== null;
  const isSelectedElemets = selectedElements !== null;

  useEffect(() => {
    if (isSelectedTextElement) {
      setFade(true);
      setDefaultFontSize(selectedElement?.state.fontSize);
      setDefaultText(selectedElement?.state.text);
      setDefaultColor(selectedElement?.state.fill);

      const storedFonts = localStorage.getItem('customFonts');
      if (storedFonts) {
        setCustomFonts(JSON.parse(storedFonts));
      }
    } else {
      setFade(false);
    }
  }, [isSelectedTextElement]);

  const handleTextSizeSelect = (fontSize) => {
    if (isSelectedTextElement) {
      const { element, stateAttrs } = getUpdatedElementAttrs(
        canvasElements,
        selectedElement.id,
        'fontSize',
        fontSize
      );
      onChange(element, stateAttrs);
      setDefaultFontSize(fontSize);
    }
  }


  const handleFontFamilySelect = (fontFamily) => {
    if (isSelectedTextElement) {
      const fontFile = allFonts.find(font => font.value === fontFamily)?.file;
      const { element, stateAttrs } = getUpdatedElementAttrs(
        canvasElements,
        selectedElement.id,
        ["fontFamily", "fontFile"],
        [fontFamily, fontFile]
      );
      onChange(element, stateAttrs);
      setDefaultFontFamily(fontFamily);
    }
  }

  useEffect(() => {
    // Create a new instance of Konva.Layer when the component is mounted
    const newLayer = new Konva.Layer();
    setLayer(newLayer);

    // Important: Add the new layer to the stage (stage)
    newLayer.add(new Konva.Text()); // Agrega un objeto temporal para evitar errores

    // Cleaning when disassembling the component
    return () => {
      // Remove stage layer on dismount
      newLayer.remove();
    };
  }, []);


  const handleTextSelect = (event) => {
    if (isSelectedTextElement) {
      const newText = event.target.value;
      const fontSize = isSelectedTextElement ? selectedElement.state.fontSize : defaultFontSize;
      const fontFamily = isSelectedTextElement ? selectedElement.state.fontFamily : defaultFontFamily;

      const tempText = new Konva.Text({
        text: newText,
        fontSize: fontSize,
        fontFamily: fontFamily,
      });

      // Add the temporary object to the stage out of view to measure the width
      layer.add(tempText);
      tempText.hide();
      layer.draw();

      const newWidth = tempText.width();

      // Removes the temporary object from the stage
      tempText.destroy();
      layer.draw();

      const { element, stateAttrs } = getUpdatedElementAttrs(
        canvasElements,
        selectedElement.id,
        'text',
        newText
      );

      stateAttrs.width = Math.min(newWidth);

      if (position === "sides") {
        stateAttrs.x = element.state.x - ((newWidth - element.state.width) / 2);
      } else if (position === "right") {
        stateAttrs.x = element.state.x - (newWidth - element.state.width);
      }

      onChange(element, stateAttrs);
      setDefaultText(newText);
    }
  };

  const handleColorSelect = (newColor) => {
    if (isSelectedTextElement) {
      const { element, stateAttrs } = getUpdatedElementAttrs(
        canvasElements,
        selectedElement.id,
        'fill',
        newColor.hex
      );
      onChange(element, stateAttrs);
      setDefaultColor(newColor.hex);
    }
  }

  const handleSelectAlign = (e) => {
    const selectAlign = e.target.value;
    if (selectedElements?.length > 0) {
      const canvasWidth = Math.floor(
        selectedMetric === 'in' ? width * inchesToPixels : width * centimetersToPixels
      );

      console.log("canvas",canvasWidth);
      // Crear un array para almacenar todas las actualizaciones pendientes
      const updatedElements = selectedElements.map((selectedElement) => {
        const elementWidth = selectedElement.state.width;
        let x = selectedElement.state.x;

        switch (selectAlign) {
          case 'center':
            x = (canvasWidth / 2) - (elementWidth / 2);
            break;
          case 'left':
            x = canvasWidth * 0.01;
            break;
          case 'right':
            x = canvasWidth - elementWidth - canvasWidth * 0.01;
            break;
          default:
            break;
        }

        return ({
          element: selectedElement, stateAttrs: { x }
        });
      });

      const readyToPaint = canvasElements.map((element) => {
        const updatedElement = updatedElements.find((updatedElement) => updatedElement.element.id === element.id);
        if (updatedElement) {
          return { ...element, state: { ...element.state, ...updatedElement.stateAttrs } };
        }
        return element;
      });
      handleCanvasElementsChange(readyToPaint);

    } else if (selectedElement) {
      const canvasWidth = Math.floor((selectedMetric === 'in') ? width * inchesToPixels : width * centimetersToPixels);
      const elementWidth = selectedElement.state.width;
      const selectAlign = e.target.value;
      console.log("canvas",canvasWidth);
      let x = 0;
      switch (selectAlign) {
        case "center":
          x = (canvasWidth / 2) - (elementWidth / 2);
          break;
        case "left":
          x = canvasWidth * 0.01;
          break;
        case "right":
          x = (canvasWidth - elementWidth) - (canvasWidth * 0.01);
          break;
        default:
          break;
      }
      setAlign(selectAlign);
      const { element, stateAttrs } = getUpdatedElementAttrs(
        canvasElements,
        selectedElement.id,
        'x',
        x
      );

      onChange(element, stateAttrs);

    }
  };



  const handleXChange = (e) => {
    const newX = parseFloat(e.target.value);
    if (!isNaN(newX) && selectedElement) {
      onChange(selectedElement, { x: newX });
    }
  };

  const handleYChange = (e) => {
    const newY = parseFloat(e.target.value);
    if (!isNaN(newY) && selectedElement) {
      onChange(selectedElement, { y: newY });
    }
  };

  const handleSelectPosition = (e) => {
    setPosition(e.target.value);
  }

  const alignElements = (alignment) => {
    if (selectedElements.length === 0) {
      return; // No hay elementos seleccionados, no hacemos nada
    }

    // Encontrar el elemento de referencia (izquierda, derecha o centro)
    let referenceX;
    switch (alignment) {
      case 'left':
        referenceX = findLeftmostX(canvasElements, selectedElements);
        break;
      case 'right':
        referenceX = findRightmostX(canvasElements, selectedElements);
        break;
      case 'center':
        referenceX = findCenterX(canvasElements, selectedElements);
        break;
      default:
        return; // Alineación no válida
    }

    // Calcular el desplazamiento necesario para alinear
    const xOffset = referenceX;

    // Actualizar las posiciones de los elementos seleccionados
    const updatedElements = selectedElements.map((element) => ({
      element,
      stateAttrs: { x: xOffset - (alignment === 'right' ? element.state.width : alignment === "center" ? (element.state.width / 2) : 0) },
    }));

    // Actualizar canvasElements con las posiciones actualizadas
    const readyToPaint = canvasElements.map((element) => {
      const updatedElement = updatedElements.find(
        (updatedElement) => updatedElement.element.id === element.id
      );
      if (updatedElement) {
        return { ...element, state: { ...element.state, ...updatedElement.stateAttrs } };
      }
      return element;
    });

    handleCanvasElementsChange(readyToPaint);
  };

  // Funciones auxiliares para encontrar la coordenada X más a la izquierda y más a la derecha
  const findLeftmostX = (elements, selectedElements) => {
    const selectedIds = new Set(selectedElements.map((element) => element.id));

    let minX = Infinity;

    elements.forEach((element) => {
      if (selectedIds.has(element.id) && element.state.x < minX) {
        minX = element.state.x;
      }
    });

    return minX !== Infinity ? minX : 0;
  };

  const findRightmostX = (elements, selectedElements) => {
    const selectedIds = new Set(selectedElements.map((element) => element.id));

    let maxX = -Infinity;

    elements.forEach((element) => {
      if (selectedIds.has(element.id)) {
        const rightX = element.state.x + element.state.width;
        if (rightX > maxX) {
          maxX = rightX;
        }
      }
    });

    return maxX !== -Infinity ? maxX : 0;
  };

  const findCenterX = (elements, selectedElements) => {
    const selectedIds = new Set(selectedElements.map((element) => element.id));

    let minX = Infinity;
    let maxX = -Infinity;

    elements.forEach((element) => {
      if (selectedIds.has(element.id)) {
        if (element.state.x < minX) {
          minX = element.state.x;
        }

        const rightX = element.state.x + element.state.width;
        if (rightX > maxX) {
          maxX = rightX;
        }
      }
    });

    return minX !== Infinity && maxX !== -Infinity ? minX + (maxX - minX) / 2 : 0;
  };


  return (
    <div>
      <Disclosure as="nav" className="bg-white">
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                {!isSelectedTextElement ? (
                  <div className={`transition-all duration-200 ${fade ? "opacity-0" : "opacity-100"} md:ml-6 md:flex md:items-center md:space-x-4`}>
                    <div className="flex flex-shrink-0 items-center">
                      <button
                        type="button"
                        onClick={handleUndo}
                        className={classNames(
                          (undoStackLength === 0 || !undoStackLength) ? "opacity-50 text-black" : "hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800",
                          "rounded-full bg-white p-1 text-black"
                        )}
                        disabled={undoStackLength === 0 || !undoStackLength}
                      >
                        <span className="sr-only">Undo</span>
                        <ArrowNarrowLeftIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        className={classNames(
                          (redoStackLength === 0 || !redoStackLength) ? "opacity-50 text-black" : "hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800",
                          "rounded-full bg-white p-1 text-black"
                        )}
                        disabled={redoStackLength === 0 || !redoStackLength}
                      >
                        <span className="sr-only">Redo</span>
                        <ArrowNarrowRightIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <input
                      type="text"
                      name="label-name"
                      id="label-name"
                      className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                      defaultValue={formatName}
                      onChange={(e) => setFormatName(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className={`flex transition-all duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
                    <div className="flex items-center md:space-x-4">
                      Edit:
                    </div>

                    <div className="md:ml-4 flex items-center md:space-x-4">
                      <textarea
                        rows={1}
                        name="edit-text-input"
                        id="edit-text-input"
                        className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md ml-2"
                        onChange={handleTextSelect}
                        value={isSelectedTextElement ? selectedElement.state.text : defaultText}
                      />
                    </div>
                    <div className="w-24 py-2 px-2 border-gray-300 rounded-md md:ml-2">
                      <SizeMenu
                        fontSizeList={FONT_SIZE_LIST}
                        fontSize={isSelectedTextElement ? selectedElement.state.fontSize : defaultFontSize}
                        handleTextSizeSelect={handleTextSizeSelect}
                      />
                    </div>
                    <div className="sm:w-32 md:w-40 py-2 md:px-2 border-gray-300 rounded-md md:ml-2">
                      <FontFamilyMenu
                        fontList={allFonts}
                        fontFamily={isSelectedTextElement ? selectedElement.state.fontFamily : defaultFontFamily}
                        handleFontFamilyChange={handleFontFamilySelect}
                      />
                    </div>

                    <div className="md:ml-4 flex items-center md:space-x-4">
                      <div className='flex'>
                        <div className="p-1 bg-white border shadow-black inline-block cursor-pointer" onClick={() => setShowColorPicker(!showColorPicker)}>
                          <div className="w-9 h-3.5 rounded-sm" style={{ background: defaultColor }} />
                        </div>
                        {showColorPicker ? (
                          <div className="absolute z-10 mt-4">
                            <div className="fixed top-0 left-0 right-0 bottom-0" onClick={() => setShowColorPicker(false)} />
                            <SketchPicker color={defaultColor} onChange={handleColorSelect} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center pl-4">
                  <span className="mr-2">Align:</span>
                  <div className="relative pl-2">
                    <select
                      className="block appearance-none w-40 bg-white border rounded-md px-6 py-2 pr-8 focus:outline-none focus:border-blue-500 border-gray-300"
                      onChange={(e) => handleSelectAlign(e)}
                      disabled={!isSelectedElemet && !isSelectedElemets}
                      value={"none"}
                    >
                      {
                        isSelectedElemet || isSelectedElemets
                          ?
                          <>
                            <option value="none" disabled hidden>Select Alignment</option>
                            <option value="center">Center</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </>
                          :
                          <>
                            <option value="none">Select a Element...</option>
                          </>
                      }
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {isSelectedTextElement && !!selectedElement.field &&
                  <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                    <div
                      className="border p-2 rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <strong>Field: </strong>{selectedElement.field}
                    </div>
                  </div>
                }
                {/* 
                <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Lock</span>
                    <TemplateIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Lock</span>
                    <LockOpenIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Duplicate</span>
                    <DuplicateIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                */}
                <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <button
                    type="button"
                    onClick={deleteElementSelected}
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Delete</span>
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  <select
                    value={selectedOption}
                    onChange={(e) => handleExportClick(e.target.value, formatName)}
                    className="relative inline-flex items-center gap-x-1.5 rounded-md border px-3 py-2 text-sm font-semibold text-ft-blue-300 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <option value="" hidden>
                      Download as
                    </option>
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="pdf">PDF</option>
                    <option value="php">PHP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      </Disclosure>

      <div className="overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">

          <div className={`flex w-auto pb-2 ${ selectedElement?.type === 'text' || selectedElement?.type === 'Checkbox' ? "justify-between" : "justify-center"} pl-4`}>
            {(selectedElement?.type === 'text' || selectedElement?.type === 'Checkbox' ) && (
              <div className="pr-4">
                <div className="relative pl-2">
                  <select
                    className="block appearance-none w-40 bg-white border rounded-md px-6 py-2 pr-8 focus:outline-none focus:border-blue-500 border-gray-300"
                    onChange={(e) => handleSelectPosition(e)}
                    disabled={!isSelectedElemet}
                    value={position}
                  >
                    {
                      isSelectedElemet
                        ?
                        <>
                          <option value="none" disabled hidden>Select Position</option>
                          <option value="sides">Sides</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </>
                        :
                        <>
                          <option value="none">Select a Element...</option>
                        </>
                    }
                  </select>
                </div>
              </div>
            )}
            <div className='flex items-center'>
              <span className="mr-2">X:</span>
              <div className="relative pl-2">
                <input
                  type="number"
                  step="1"
                  value={Math.floor(selectedElement?.state.x) || 0}
                  onChange={handleXChange}
                  className="block appearance-none w-3/4 bg-white border rounded-md border-gray-300 px-6 py-2 pr-8 focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="mr-2">Y:</span>
              <div className="relative pl-2">
                <input
                  type="number"
                  step="1"
                  value={Math.floor(selectedElement?.state.y) || 0}
                  onChange={handleYChange}
                  className="block appearance-none w-3/4 bg-white border rounded-md border-gray-300 px-6 py-2 pr-8 focus:outline-none focus:border-blue-500"
                />
              </div>
              {
                selectedElements?.length > 1 && (
                  <div className="flex justify-start space-x-2">
                    <button
                      className={`flex items-center justify-center px-3 py-2 rounded hover:bg-gray-300 `}
                      onClick={() => alignElements('left')}
                    >
                      <img src={LeftAlignmentIcon} alt="Left Alignment" className="w-6 h-6" />
                    </button>
                    <button
                      className={`flex items-center justify-center px-3 py-2 rounded bg-gray-300 `}
                      onClick={() => alignElements('center')}
                    >
                      <img src={CenterAlignmentIcon} alt="Center Alignment" className="w-6 h-6" />
                    </button>
                    <button
                      className={`flex items-center justify-center px-3 py-2 rounded hover:bg-gray-300`}
                      onClick={() => alignElements('right')}
                    >
                      <img src={RightAlignmentIcon} alt="Right Alignment" className="w-6 h-6" />
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
