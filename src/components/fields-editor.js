import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Transformer, Text } from 'react-konva';

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
    fill
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


export default function FieldsEditor({ canvasElements, onChange, onDelete }) {
  const [search, setSearch] = useState("");
  const [editedFields, setEditedFields] = useState({});
  const [selectedFields, setSelectedFields] = useState({});
  const [editField, setEditField] = useState(""); 
  const [fields, setFields] = useState([]);

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
    onChange({
      id: Date.now().toString(),
      type: "Checkbox",
      draggable: true,
      isDynamic: true,
      field: text,
      state: {
        fill: "#000000",
        text: text,
        x: 20,
        y: 30,
        rotation: 0,
        fontFamily: "Arial",
        fontSize: 20,
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

  const handleEditSubmit = (field) => {
    const newText = editFieldRef.current.value;
    const element = canvasElements.find((element) => element?.field === field);
    
    onChange(element, {
      text: newText
    });

    setEditedFields((prevEditedFields) => ({
      ...prevEditedFields,
      [field]: newText,
    }));
    setEditField("");
  };

  const removeTextFromCanvas = (field) => {
    const element = canvasElements.find((element) => element?.field === field);
    onDelete(element);

    setEditedFields((prevEditedFields) => {
      const { [field]: fieldToRemove, ...newEditedFields } = prevEditedFields;
      return newEditedFields;
    });
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
  
 