import { useState } from 'react';
import {
  PencilIcon,
  PhotographIcon,
  DeviceMobileIcon,
  ColorSwatchIcon,
  TagIcon,
  ArrowsExpandIcon,
  CollectionIcon,
} from '@heroicons/react/outline';
import ColorPalette from './color-palette';
import TextEditor from './text-editor';
import ImageEditor from './image-editor';
import FieldsEditor from './fields-editor';
import SizeLabelEditor from './sizelabel-editor';
import LayersEditor from './layers-editor';
import Templates from './templates';

export default function SidePanel({
  onColorChange,
  onChangeW,
  onChangeH,
  onChangeRotation,
  fontFamily,
  setFontFamily,
  fontFamilyList,
  fontSize,
  setFontSize,
  imageList,
  setImageList,
  canvasElements,
  selectedElement,
  onSelect,
  getCanvasElement,
  onChange,
  onDelete,
  setSelectedTemplate,
  templates,
  handleCaptureClick,
  selectedMetric,
  setSelectedMetric,
  format,
  fetchFontFamily,
  align,
  width,
  position,
  setPosition
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedW, setSelectedW] = useState(format.width);
  const [selectedH, setSelectedH] = useState(format.height);
  const [selectedRotation, setSelectedRotation] = useState(format.angle);

  function handleChangeW(newWidth) {
    setSelectedW(newWidth);
    onChangeW(newWidth);
  }

  function handleChangeH(newHeight) {
    setSelectedH(newHeight);
    onChangeH(newHeight);
  }

  function handleChangeRotation(newRotation) {
    setSelectedRotation(newRotation);
    onChangeRotation(newRotation);
  }

  function handleColorChange(newColor) {
    setSelectedColor(newColor);
    onColorChange(newColor);
  }

  const tabs = [
    {
      label: 'Templates',
      content: (
        <Templates 
          setSelectedTemplate = {setSelectedTemplate}
          templates={templates}
          handleCaptureClick={handleCaptureClick}
          format={format}
          canvasElements={canvasElements}
          closeSidePanel={() => setSelectedOption(null)}
        />
      ),
      icon: DeviceMobileIcon,
    },
    {
      label: 'Text',
      content: (
        <TextEditor
          setFontFamily={setFontFamily}
          fontFamily={fontFamily}
          setFontSize={setFontSize}
          fontFamilyList={fontFamilyList}
          fontSize={fontSize}
          canvasElements={canvasElements}
          onChange={onChange}
          selectedElement={selectedElement}
          fetchFontFamily={fetchFontFamily}
          align={align}
          selectedMetric={selectedMetric}
          width={width}
          position ={position}
          setPosition ={setPosition}
        />
      ),
      icon: PencilIcon,
    },
    {
      label: 'Images',
      content: (
        <ImageEditor
          imageList={imageList}
          setImageList={setImageList}
          onChange={onChange}
        />
      ),
      icon: PhotographIcon,
    },
    /* {
      label: "Elements",
      content: "Aqui se mostraran elementos como formas",
      icon: CubeIcon,
    },*/
    {
      label: 'Fields',
      content: (
        <FieldsEditor 
          canvasElements={canvasElements}
          onChange={onChange} 
          onDelete={onDelete}
        />
      ),
      icon: TagIcon,
    },
    {
      label: 'Background',
      content: (
        <ColorPalette
          initialColor={selectedColor}
          onColorChange={handleColorChange}
        />
      ),
      icon: ColorSwatchIcon,
    },
    {
      label: 'Layers',
      content: (
        <LayersEditor
          canvasElements={canvasElements}
          onSelect={onSelect}
          getCanvasElement={getCanvasElement}
          onChange={onChange}
        />
      ),
      icon: CollectionIcon,
    },
    {
      label: 'Resize',
      content: (
        <SizeLabelEditor
          initialW={selectedW}
          initialH={selectedH}
          initialRotation={selectedRotation}
          onChangeW={handleChangeW}
          onChangeH={handleChangeH}
          onChangeRotation={handleChangeRotation}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
      ),
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
                        ? 'bg-gray-200 text-[#3c5865]'
                        : 'bg-white text-[#3c5865]'
                    } p-4 border-b border-x border-gray-300 focus:outline-none hover:bg-gray-200 text-sm`}
                    onClick={() => setActiveTab(index)}
                  >
                    <div className="flex justify-center py-2">
                      <tab.icon
                        className="h-6 w-6 text-[#3c5865]"
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
                    activeTab === index ? 'block' : 'hidden'
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
                  className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4 mt-4"
                  onClick={() => setSelectedOption(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
