import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Transformer, Text } from 'react-konva';
import { Text as konvaText } from 'konva';
import LeftAlignmentIcon from '../svg/left-alignment.svg';
import CenterAlignmentIcon from '../svg/center-alignment.svg';
import RightAlignmentIcon from '../svg/right-alignment.svg';
import Konva from 'konva';

export const LoadField = ({
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
    setCurrentElementWidth,
    onDragMove,
    onDragEnd,
    position,
  }) => {
    const textRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected) {
            trRef.current.nodes([textRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);
  
    useEffect( () => {
      if(text){
        setCurrentElementWidth(textRef.current.width());
      }
    }, [text]);

    useEffect( () => {
      if(fontSize){
        setCurrentElementWidth(textRef.current.width());
      }
    }, [fontSize]);

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
                if (onDragEnd) {
                        onDragEnd(e);
                    }
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
              onDragMove={onDragMove}
          />
          {isSelected && (
            <Transformer
            ref={trRef}
            rotationSnaps={(e)=>{console.log("rotation", e)}}
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


export default function FieldsEditor({ canvasElements, onChange, onDelete, selectedElement, fontSize }) {
  const [search, setSearch] = useState("");
  const [editedFields, setEditedFields] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [editField, setEditField] = useState(""); 
  const [fields, setFields] = useState([]);
  const [alignment, setAlignment] = useState('left');
  const [layer, setLayer] = useState(null);
  const [defaultFontSize, setDefaultFontSize] = useState(fontSize);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/fields`);
        if (response.ok) {
          const fieldsData = await response.json();
          const fieldValues = {};
          fieldsData.forEach((element) => {
            // ignore QTY
            if (element.name !== "QTY") {
              fieldValues[element.name] = false;
            }
          });
          setFields(fieldValues);
        } else {
          console.error('Error fields data:', response.status);
        }
      } catch (error) {
        console.error('Error fields data:', error);
      }
    };

    fetchFields();
  }, []);

  const handleCheckboxChange = (e) => {
    const name = e.target.name;
    const checked = e.target.checked;

    if (checked) {
      setSelectedFields((prevSelectedFields) => ({
        ...prevSelectedFields,
        [name]: true,
      }));
      setEditField(name);
      addTextToCanvas(name);
    } else {
      setSelectedFields((prevSelectedFields) => {
        const { [name]: fieldToRemove, ...newSelectedFields } = prevSelectedFields;
        return newSelectedFields;
      });
      setEditField("");
      removeTextFromCanvas(name);
    }
  };

  const addTextToCanvas = (text) => {
    const attrs = { 
      x: 20, 
      y: 30, 
      text: text, 
      fontSize: 20, 
      fontFile: "arial.ttf",
      fontFamily: "Arial", 
      fill: "#000000" 
    };
    // create text to calculate width and height
    const newText = new konvaText(attrs);
    const width = newText.width();
    const height = newText.height();
    onChange({
      id: Date.now().toString(),
      type: "Checkbox",
      draggable: true,
      isDynamic: true,
      field: text,
      state: {
        ...attrs,
        width,
        height,
        rotation: 0,
      },
    });
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  const fieldSelected = Object.keys(selectedFields).join(", ");

  const results = !search
    ? Object.keys(fields)
    : Object.keys(fields).filter((data) =>
        data.toLowerCase().includes(search.toLowerCase())
      );

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

  useEffect(() => {
    const newLayer = new Konva.Layer();
    setLayer(newLayer);
    newLayer.add(new Konva.Text()); 
  
    return () => {
      newLayer.remove();
    };
  }, []);

  const handleEditSubmit = (field) => {
    const newText = editFieldRef.current.value;
    let x;
    const fontSize = isSelectedElement ? selectedElement.state.fontSize : defaultFontSize;
    const fontFamily = isSelectedElement ? selectedElement.state.fontFamily : fontFamily;
    
    const tempText = new Konva.Text({
      text: newText,
      fontSize: fontSize,
      fontFamily: fontFamily,
    });

    layer.add(tempText);
    tempText.hide();
    layer.draw();

    const newWidth = tempText.width();
      
    const widthFinal = Math.min(newWidth);

    if (alignment === "center") {
      x = selectedElement.state.x - ((newWidth - selectedElement.state.width) / 2);
     } else if (alignment === "right") {
      x = selectedElement.state.x - (newWidth - selectedElement.state.width);
     }
     
    if (x) {
      updateSelectedElement(selectedElement.id, ["text", "width", "x"], [newText, widthFinal, x]);
    } else {
      updateSelectedElement(selectedElement.id, ["text", "width"], [newText, widthFinal]);
    }

    setEditedFields((prevEditedFields) => ({
      ...prevEditedFields,
      [field]: newText,
    }));

    tempText.destroy();
    layer.draw();
    setEditField(field);
  };

  const removeTextFromCanvas = (field) => {
    const element = canvasElements.find((element) => element?.field === field);
    onDelete(element);

    setEditedFields((prevEditedFields) => {
      const { [field]: fieldToRemove, ...newEditedFields } = prevEditedFields;
      return newEditedFields;
    });
  };

  const isSelectedElement = !!selectedElement && (selectedElement.type === "text" || selectedElement.type === "Checkbox");

  const handleAlignmentChange = (alignment) => {
    setAlignment(alignment);
  };

  const editFieldRef = useRef();
   
    return (
      <>
        <div className="p-3">
          <label htmlFor="input-group-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 dark:text-gray-400"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="input-group-search"
              className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full pl-10 p-2.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800"
              placeholder="Search field"
              onChange={searcher}
              value={search}
            />
          </div>
        </div>
        <div className="flex justify-start mt-4 space-x-2">
        {/* Button Alignment text */}
        <button
          className={`flex items-center justify-center px-3 py-2 rounded hover:bg-gray-300 ${ alignment === 'left' ? 'bg-gray-200' : ''}`}
          onClick={() => handleAlignmentChange('left')}
        >
          <img src={LeftAlignmentIcon} alt="Left Alignment" className="w-6 h-6" />
        </button>
        <button
          className={`flex items-center justify-center px-3 py-2 rounded bg-gray-300 ${ alignment === 'center' ? 'bg-gray-200' : ''} `}
          onClick={() => handleAlignmentChange('center')}
        >
          <img src={CenterAlignmentIcon} alt="Center Alignment" className="w-6 h-6" />
        </button>
        <button
          className={`flex items-center justify-center px-3 py-2 rounded hover:bg-gray-300 ${ alignment === 'right' ? 'bg-gray-200' : ''}`}
          onClick={() => handleAlignmentChange('right')}
        >
          <img src={RightAlignmentIcon} alt="Right Alignment" className="w-6 h-6" />
        </button>
      </div>
        <p className="block text-sm font-medium text-gray-700 px-3 sm:pt-4 pb-5">
          Fields Selected:{" "}
          <span className="text-sm  font-normal text-gray-700">
            {fieldSelected}
          </span>
        </p>
        <div className="overflow-y-auto h-[610px] px-1">
          {results.map((attribute, index) => (
            <div key={index} className="flex items-center">
              <input
                id={`filter-mobile-${attribute}-${index}`}
                name={attribute}
                defaultValue={selectedFields[attribute]}
                type="checkbox"
                defaultChecked={selectedFields[attribute]}
                className="h-4 w-4 border-gray-300 rounded text-ft-blue-300 focus:ring-ft-yellow-400"
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor={`filter-mobile-${attribute}-${index}`}
                className="ml-3 min-w-0 flex-1 text-gray-500"
              >
                {attribute}
              </label>
              {editField === attribute && (
                <div>
                  <input
                    type="text"
                    defaultValue={editedFields[attribute] || attribute}
                    className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 text-sm focus:outline-none focus:ring-yellow-400 focus:border-yellow-400"
                    ref={editFieldRef}
                  />
                  <button
                    type="submit"
                    className="ml-2 px-3 py-1 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
                    onClick={() => handleEditSubmit(attribute)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
}
  
 