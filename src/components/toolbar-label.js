import { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import {
  TrashIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
} from '@heroicons/react/outline';

export default function ToolbarLabel({
  selectedElement,
  handleDynamicElement,
  canvasElements,
  setCanvasElements,
  setSelectedElement,
  handleExportClick,
  selectedOption,
}) {
  const [checked, setChecked] = useState(false);
  const [formatName, setFormatName] = useState('newlabel');
  const isSelected = !!selectedElement;

  useEffect(() => {
    const isChecked = isSelected ? selectedElement.isDynamic || false : false;
    setChecked(isChecked);
  }, [selectedElement, isSelected]);

  const markCheckbox = (e) => {
    if (selectedElement) {
      handleDynamicElement(selectedElement, e.target.checked);
      setChecked(e.target.checked);
    } else {
      setChecked(false);
    }
  };

  const deleteElementSelected = () => {
    if (selectedElement) {
      const elements = canvasElements.filter(
        (element) => element.id !== selectedElement.id
      );
      setCanvasElements(elements);
      setSelectedElement(null);
    }
  };

  return (
    <div>
      <Disclosure as="nav" className="bg-white">
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <ArrowNarrowLeftIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-ft-blue-300 hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <ArrowNarrowRightIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="md:ml-6 md:flex md:items-center md:space-x-4">
                  <input
                    type="text"
                    name="label-name"
                    id="label-name"
                    className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    defaultValue={formatName}
                    onChange={(e) => setFormatName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center">
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
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      </Disclosure>
    </div>
  );
}
