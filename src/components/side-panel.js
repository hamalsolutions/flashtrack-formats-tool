import { useState } from "react";
import {
  PencilIcon,
  ArrowsExpandIcon,
  UploadIcon,
  PhotographIcon,
  CollectionIcon,
  CubeIcon,
  DeviceMobileIcon,
  ColorSwatchIcon,
} from "@heroicons/react/outline";
import ColorPalette from "./color-palette";
import TextEditor from "./text-editor";
import ImageEditor from "./image-editor";
import FieldsEditor from "./fields-editor";

export default function SidePanel({
  onColorChange,
  setFontFamily, 
  imageList,
  setImageList,
  setCanvasElements,
  fields,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const [selectedColor, setSelectedColor] = useState("#ffffff");

  function handleColorChange(newColor) {
    setSelectedColor(newColor);
    onColorChange(newColor);
  }

  const tabs = [
    {
      label: "Templates",
      content: "Aqui se mostraran los Templates",
      icon: DeviceMobileIcon,
    },
    {
      label: "Text",
      content: <TextEditor setFontFamily={setFontFamily} />,
      icon: PencilIcon,
    },
    {
      label: "Images",
      content: <ImageEditor 
        imageList={imageList} 
        setImageList={setImageList} 
        setCanvasElements={setCanvasElements}
      />,
      icon: PhotographIcon,
    },
    {
      label: "Elements",
      content: "Aqui se mostraran elementos como formas",
      icon: CubeIcon,
    },
    {
      label: "Fields",
      content: <FieldsEditor fields={fields}/>,
      icon: UploadIcon,
    },
    {
      label: "Background",
      content: (
        <ColorPalette
          initialColor={selectedColor}
          onColorChange={handleColorChange}
        />
      ),
      icon: ColorSwatchIcon,
    },
    {
      label: "Layers",
      content: "Aqui se indicaran los elementos que hay en el lienzo",
      icon: CollectionIcon,
    },
    {
      label: "Resize",
      content: "Aqui se indicara el tamaño de la etiqueta",
      icon: ArrowsExpandIcon,
    },
  ];

  const handleOptionClick = (option) => {
    if (selectedOption === option) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  };

  return (
    <>
      <div className="grid grid-cols-4">
        {/* A partir de aqui side bar option desktop*/}
        <div className="col-span-4 hidden md:block">
          <div className="flex w-full">
            <div className="w-1/4">
              <div className="flex flex-col border-r">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    className={`${
                      activeTab === index
                        ? "bg-gray-200 text-ft-blue-300"
                        : "bg-white text-ft-blue-300"
                    } p-4 border-b border-x border-gray-300 focus:outline-none hover:bg-gray-200 text-sm`}
                    onClick={() => setActiveTab(index)}
                  >
                    <div className="flex justify-center py-2">
                      <tab.icon
                        className="h-6 w-6 text-ft-blue-300"
                        aria-hidden="true"
                      />
                    </div>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-3/4">
              {tabs.map((tab, index) => (
                <div
                  key={index}
                  className={`${
                    activeTab === index ? "block" : "hidden"
                  } p-4 bg-white border-l border-r border-b`}
                >
                  {tab.content}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* A partir de aqui side bar option mobile*/}
        <div className="col-span-4 block md:hidden">
          <nav className="bg-white fixed bottom-0 left-0 right-0 z-40 overflow-auto border">
            <div className="max-w-7xl mx-auto px-2">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex items-baseline space-x-4 z-40">
                    {tabs.map((option, index) => (
                      <button
                        key={index}
                        className="text-ft-blue-300 hover:bg-gray-200 px-3 py-2 rounded-md text-xs font-medium"
                        onClick={() => handleOptionClick(option)}
                      >
                        <div className="flex justify-center py-2">
                          <option.icon
                            className="h-4 w-4 text-ft-blue-300"
                            aria-hidden="true"
                          />
                        </div>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {selectedOption && (
            <div className="fixed bottom-14 left-0 right-0 flex justify-center z-20 border">
              <div className="w-full max-w-7xl bg-white shadow-lg rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">
                  {selectedOption.label}
                </h3>
                <p className="text-gray-500">{selectedOption.content}</p>
                <button
                  className="bg-ft-blue-300 text-white px-4 py-2 rounded-md mt-4"
                  onClick={() => setSelectedOption(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}