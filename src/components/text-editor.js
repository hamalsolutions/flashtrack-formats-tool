import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Transformer, Text } from 'react-konva';
import { Text as konvaText } from 'konva';
import { SketchPicker } from "react-color";
import { ColorSwatchIcon, XIcon } from "@heroicons/react/outline";
import { Listbox, Transition, Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid';

export const FONT_FAMILY_LIST = [
  { name: 'Arial', value: 'Arial', file: "arial.ttf" },
  { name: 'Arial Bold', value: 'Arial Black', file: "arialbd.ttf" },
  { name: 'Helvetica', value: 'Helvetica', file: "Helvetica_Neue.ttf" },
  { name: 'Times New Roman', value: 'Times New Roman', file: "times.ttf" },
  { name: 'Times New Roman Bold', value: 'Times New Roman Black', file: "timesbd.ttf" },
  { name: 'Roboto', value: 'Roboto', file: "" },
  { name: 'Verdana', value: 'Verdana', file: "" },
  { name: 'Lato', value: 'Lato', file: "" },
  { name: 'Calibri', value: 'Calibri', file: "" },
  { name: 'Cambria', value: 'Cambria', file: "" },
];

export const FONT_SIZE_LIST = [
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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// font family component
export function FontFamilyMenu({ fontList, fontFamily, handleFontFamilyChange }) {
  const [query, setQuery] = useState('');
  const [selectedFont, setSelectedFont] = useState(null);

  useEffect(() => {
    if (fontFamily) {
      setSelectedFont(fontList.find(font => font.value === fontFamily));
    }
  }, [fontList, fontFamily]);
  
  const filteredFonts =
    query === ''
      ? fontList
      : fontList.filter((font) => {
          return font.name.toLowerCase().includes(query.toLowerCase())
        });

  const handleFontFamily = (font) => {
    setSelectedFont(font);
    handleFontFamilyChange(font.value);
  }

  return (
    <Combobox as="div" value={selectedFont} onChange={handleFontFamily}>
      <div className="relative mt-2">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(font) => font?.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredFonts.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredFonts.map((font, index) => (
              <Combobox.Option
                key={index}
                value={font}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={classNames('block truncate', selected && 'font-semibold')}>{font.name}</span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

// size menu component
export function SizeMenu({ fontSizeList, fontSize, handleTextSizeSelect }) {
  const [selected, setSelected] = useState({ value: fontSize });

  useEffect(() => {
    setSelected({ value: fontSize });
  }, [fontSize]);

  const handleTextSize = (size) => {
    setSelected(size);
    handleTextSizeSelect(size.value);
  }

  return (
    <Listbox value={selected} onChange={handleTextSize}>
      {({ open }) => (
        <div className='w-full'>
          {/* <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Listbox.Label> */}
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.value}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {fontSizeList.map((size, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={size}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {size.value}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}

export const LoadText = ({
  id,
  text,
  x,
  y,
  width,
  height,
  draggable,
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
            onDragEnd={(e) => {
              const node = textRef.current;
              onChange({
                  x: node.x(),
                  y: node.y(),
              });
            }}
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
                rotation: node.rotation(),
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

export default function TextEditor ({fontFamily, setFontFamily, fontSize, setFontSize, canvasElements, onChange, selectedElement}){

  const [view, setView] = useState('fontList'); // 'fontList' o 'uploadFont'
  const [newFontName, setNewFontName] = useState('');
  const [newFontFile, setNewFontFile] = useState(null);
  const [customFonts, setCustomFonts] = useState([]); // Lista de fuentes personalizadas
  const [textContent, setTextContent] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [color, setColor] = useState("#000000");
  const [defaultFontSize, setDefaultFontSize] = useState(fontSize);
  const [fontFileName, setFontFileName] = useState("arial.ttf");
  const [error, setError] = useState(false);

  const allFonts = [...FONT_FAMILY_LIST, ...customFonts];

  const button = document.getElementById("add-text-button");

  const isSelectedElement = !!selectedElement && (selectedElement.type === "text" || selectedElement.type === "Checkbox");

  useEffect(() => {
    // Carga las fuentes personalizadas guardadas en el localStorage al iniciar la aplicación
    const storedFonts = localStorage.getItem('customFonts');
    if (storedFonts) {
      setCustomFonts(JSON.parse(storedFonts));
    }
  }, []);

  useEffect(() => {
    setDefaultFontSize(fontSize);
  }, [fontSize]);

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
    const element = canvasElements.find((element) => element.id === id);
    const stateAttrs = Array.isArray(property) > 0 
      ? property.reduce((acc, curr, index) => {
          acc[curr] = value[index];
          return acc;
        }, {}) 
      : { [property]: value };
    onChange(element, stateAttrs);
  }

  const handleFontFamilyChange = (fontFamily) => {
    const fontFile = allFonts.find(font => font.value === fontFamily)?.file;
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, ["fontFamily", "fontFile"], [fontFamily, fontFile]);
    } else {
      setFontFamily(fontFamily);
    }
    setFontFileName(fontFile);
  };

  const handleNewFontNameChange = (event) => {
    setNewFontName(event.target.value);
  };

  const handleNewFontFileChange = (event) => {
    setNewFontFile(event.target.files[0]);
    const fileName = event.target.files[0].name;
    setFontFileName(fileName);
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

  const handleTextSizeSelect = (fontSize) => {
    if (isSelectedElement) {
      updateSelectedElement(selectedElement.id, "fontSize", Number(fontSize));
    }else{
      setDefaultFontSize(Number(fontSize));
      setFontSize(Number(fontSize));
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

  const addTextToCanvas = () => {
    const attrs = { 
      x: 10, 
      y: 10, 
      text: textContent, 
      fontSize: defaultFontSize, 
      fontFamily: fontFamily, 
      fill: color 
    };
    // create text to calculate width and height
    const newText = new konvaText(attrs);
    const width = newText.width();
    const height = newText.height();
    onChange({
      id: Date.now().toString(),
      type: "text",
      draggable: true,
      isDynamic: true,
      state: {
        ...attrs,
        width,
        height,
        rotation: 0,
        fontFile: fontFileName,
      }
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
            <FontFamilyMenu 
              fontList={allFonts} 
              fontFamily={isSelectedElement ? selectedElement.state.fontFamily : fontFamily}
              handleFontFamilyChange={handleFontFamilyChange}
            />
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
          <div className="mb-4 w-24">
            <p>Font size: </p>
            <SizeMenu 
              fontSizeList={FONT_SIZE_LIST}
              fontSize={isSelectedElement ? selectedElement.state.fontSize : defaultFontSize} 
              handleTextSizeSelect={handleTextSizeSelect}
            />
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