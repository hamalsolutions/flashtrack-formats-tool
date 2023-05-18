import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Transformer, Text } from 'react-konva';
import { SketchPicker } from "react-color";
import { ColorSwatchIcon, XIcon } from "@heroicons/react/outline";

const FONT_FAMILY_LIST = [
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Calibri', value: 'Calibri' },
  { name: 'Cambria', value: 'Cambria' },
  { name: 'Helvetica', value: 'Helvetica' },
];

const FONT_SIZE_LIST = [
  { value: 8 },
  { value: 9 },
  { value: 10 },
  { value: 11 },
  { value: 12 },
  { value: 14 },
  { value: 18 },
  { value: 24 },
  { value: 30 },
  { value: 36 },
  { value: 48 },
  { value: 60 },
  { value: 72 },
  { value: 96 },
];

export const LoadText = ({
  id,
  text,
  x,
  y,
  width,
  height,
  draggable,
  onDragStart,
  onDragEnd,
  isSelected,
  onSelect,
  onChange,
  fontFamily,
  fontSize,
  fill,
  selectedElement
}) => {
  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {
      if (isSelected) {
          trRef.current.nodes([textRef.current]);
          trRef.current.getLayer().batchDraw();
      }
  }, [isSelected]);

  return (
    <Fragment>
        <Text
            id={id}
            ref={textRef}
            text={text}
            x={x}
            y={y}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fill={fill}
            width={width}
            height={height}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={(e) => {
              const node = textRef.current;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              node.scaleX(1);
              node.scaleY(1);
              onChange({
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(node.height() * scaleY),
              });
            }}
            onTransform={() => {
              const node = textRef.current;
              node.setAttrs({
                width: Math.max(node.width() * node.scaleX(), 20),
                height: Math.max(node.height() * node.scaleY(), 20),
                scaleX: 1,
                scaleY: 1,
              });
            }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 20) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
    </Fragment>
  );
};

export default function TextEditor ({fontFamily, setFontFamily, setCanvasElements, selectedElement}){

  const [view, setView] = useState('fontList'); // 'fontList' o 'uploadFont'
  const [newFontName, setNewFontName] = useState(fontFamily);
  const [newFontFile, setNewFontFile] = useState(null);
  const [customFonts, setCustomFonts] = useState([]); // Lista de fuentes personalizadas
  const [textContent, setTextContent] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [color, setColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(12);
  const [error, setError] = useState(false);

  const button = document.getElementById("add-text-button");

  const isSelectedElement = selectedElement && selectedElement.type === "text" ? true : false;

  useEffect(() => {
    // Carga las fuentes personalizadas guardadas en el localStorage al iniciar la aplicación
    const storedFonts = localStorage.getItem('customFonts');
    if (storedFonts) {
      setCustomFonts(JSON.parse(storedFonts));
    }
  }, []);

  useEffect(() => {
    // Guarda las fuentes personalizadas en el localStorage al actualizar la lista
    localStorage.setItem('customFonts', JSON.stringify(customFonts));
  }, [customFonts]);

  useEffect(() => {
    // Agrega una etiqueta de estilo al encabezado de la página para cargar las fuentes personalizadas
    const customFontsStylesheet = document.createElement('style');
    const fontFaceRules = customFonts.map(font => {
      return `
        @font-face {
          font-family: "${font.name}";
          src: url(${font.file});
        }
      `;
    });
    customFontsStylesheet.textContent = fontFaceRules.join('\n');
    document.head.appendChild(customFontsStylesheet);
  }, [customFonts]);

  //Permite modificar el elemento seleccionado
  const updateSelectedElement = (id, property, value) => {
    setCanvasElements((prevElements) => {
      return prevElements.map((obj) => {
        if (obj.id === id) {
          return {
            ...obj,
            state: {
              ...obj.state,
              [property]: value,
            },
          };
        }
        return obj;
      });
    });
  }

  const handleFontFamilyChange = (event) => {
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, "fontFamily", event.target.value);
    }else{
      setFontFamily(event.target.value);
    }
  };

  const handleNewFontNameChange = (event) => {
    setNewFontName(event.target.value);
  };

  const handleNewFontFileChange = (event) => {
    setNewFontFile(event.target.files[0]);
  };
    
  function handleView(view) {
    setView(view);
    setError(false);    
  }

  const handleTextContent = (event) => {
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, "text", event.target.value);
    }else{
     setTextContent(event.target.value);
    }
  };

  const handleNewText = () => {
    if (textContent.length !== 0) {
      addTextToCanvas();
      setTextContent("");
    }
  }

  const handleEnterToAddText = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      button.click();
      setTextContent("");
    }
  }

  function handleColorChange(newColor) {
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, "fill", newColor.hex);
    }else{
      setColor(newColor.hex);
    }
  }

  const handleTextSizeSelect = (event) => {
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, "fontSize", event.target.value);
    }else{
      setFontSize(parseInt(event.target.value));
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!newFontName.trim()) {
      setError(true);
      return;
    }
      
    // Agrega la nueva fuente a la lista de fuentes personalizadas
    const newFont = {
      name: newFontName,
      file: URL.createObjectURL(newFontFile),
      value: newFontName,
    };
    setCustomFonts([...customFonts, newFont]);
    // Reinicia los campos del formulario
    setNewFontName('');
    setNewFontFile(null);
    // Cambia la vista de nuevo a la lista de fuentes
    setView('fontList');
    setError(false);
  };

  const allFonts = [...FONT_FAMILY_LIST, ...customFonts];

  const addTextToCanvas = () => {
    setCanvasElements((prev) => {
        const newElement = {
            id: Date.now().toString(),
            type: "text",
            draggable: true,
            isDynamic: true,
            state: {
                fill: color,
                text: textContent,
                x: 10,
                y: 10,
                fontFamily: fontFamily,
                fontSize: fontSize,
              }
        };
        return [...prev, newElement];
    });
  }

  return (
    <div>
      <div className="flex justify-between w-full mb-4 pb-4">
        <textarea
          rows={4}
          name="add-text-input"
          id="add-text-input"
          className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
          placeholder={"Set text Here..."}
          onChange={handleTextContent}
          value={isSelectedElement ? selectedElement.state.text : textContent}
          onKeyDown={handleEnterToAddText}
        />
        <button 
          className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold px-4" 
          onClick={handleNewText}
          id="add-text-button"
          name="add-text-button"
        >
          Add text
        </button>
      </div>
      {view === 'fontList' ? (
        <div className="pb-4 mb-2">
          <div>
            <label htmlFor="font-family-select" className="text-ft-blue-300" >Font: </label>
            <select 
              id="font-family-select" 
              className="py-2 max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md" 
              value={isSelectedElement ? selectedElement.state.fontFamily : fontFamily} 
              onChange={handleFontFamilyChange}
            >
              {allFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
            <div className="flex justify-left w-full mt-8">
              <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={() => handleView('uploadFont')}>Upload new font</button>
            </div> 
        </div>
      ) : (
        <div className="pb-4 mb-2">
          <h2 className="text-ft-blue-300">Upload new font</h2>
          <div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="new-font-name"  className="text-ft-blue-300" >Font name: </label>
              <input id="new-font-name" type="text" className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md" value={newFontName} onChange={handleNewFontNameChange} />
              {error && (
                <p className="text-red-600 text-sm mt-1">This field is required</p>
              )}
              <br />
              <label htmlFor="new-font-file" className="text-ft-blue-300" >Font file: </label>
                <label className="block text-gray-700 text-sm font-bold mb-4 mt-2 pb-4">
                  Upload Font:
                <input type="file" className="hidden" accept=".ttf, .otf" onChange={handleNewFontFileChange} />
                <span className="ml-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg cursor-pointer">
                  Choose file
                </span>
            </label>
                <br />
                <div className="flex justify-start w-full">
                <button  className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" type="submit">Add Font</button>
                <button  className="bg-white px-4 mx-2 border border-[#3c5865] rounded-md shadow-sm text-sm font-bold text-[#3c5865] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c5865]" onClick={() => handleView('fontList')} >Cancel</button>
                </div>
            </form>
          </div>
        </div>
      )}
      <div>
        <div className="mt-4">
          <div className="flex mb-4">
            <p>Font size: </p>
            <select 
              className="ml-2 shadow-sm" 
              onChange={handleTextSizeSelect}
              value={isSelectedElement ? selectedElement.state.fontSize : fontSize}
            >
              {FONT_SIZE_LIST.map((fontSize, index) => (
                <option key={index} value={fontSize.value}>
                  {fontSize.value}
                </option>
              ))}
            </select>
          </div>
          <div className='flex'>
            <button
              className="flex justify-between bg-gray-200 px-4 py-4 text-white rounded-md"
              onClick={() => setShowPicker(!showPicker)}
            >
              <p className='mx-2'>Font Color</p>
              {showPicker ? (
                <XIcon
                  className="h-6 w-6 text-ft-blue-300 "
                  aria-hidden="true"
                />
                ) : (
                  <ColorSwatchIcon
                    className="h-6 w-6 text-ft-blue-300"
                    aria-hidden="true"
                  />
                  )}
            </button>
            <input 
              className="mx-2 px-2"
              type="color" 
              value={isSelectedElement ? selectedElement.state.fill : color}
              disabled
            />  
          </div>
          {showPicker && (
            <div className="absolute top-0 left-0 z-10 mt-10">
              <SketchPicker color={isSelectedElement ? selectedElement.state.fill : color} onChange={handleColorChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}