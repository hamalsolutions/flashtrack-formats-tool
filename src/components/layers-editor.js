import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LayersEditor({
  canvasElements,
  onSelect,
  getCanvasElement,
  onChange,
}) {
  const handleSelectObject = (element) => () => {
    onSelect(element);
  };

  const upLayer = (index) => () => {
    let elementProv = canvasElements[index - 1];
    canvasElements[index - 1] = canvasElements[index];
    getCanvasElement(canvasElements[index - 1]);
    canvasElements[index] = elementProv;
    getCanvasElement(canvasElements[index]);
    onChange(canvasElements[index-1],{},{});
  };
  const downLayer = (index) => () => {
    let elementProv = canvasElements[index + 1];
    canvasElements[index + 1] = canvasElements[index];
    getCanvasElement(canvasElements[index + 1]);
    canvasElements[index] = elementProv;
    getCanvasElement(canvasElements[index]);
    onChange(canvasElements[index+1],{},{});
  };

  return (
    <>
      <p className="block text-sm font-medium text-gray-700 px-3 sm:pt-4 pb-5">
        List of layers:{' '}
      </p>
      <div className="overflow-y-auto h-[625px] px-1">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Content
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Coords
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {canvasElements.map((element, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-gray-900 sm:pl-0">{index + 1}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-gray-900 sm:pl-0">
                      <button
                        className="text-gray-700 text-sm font-medium px-4 hover:bg-gray-300"
                        onClick={handleSelectObject(element)}
                        id={index}
                        name={index}
                        value={index}
                      >
                        {(element.type === "Checkbox") ? "Field" : element.type}
                      </button>
                    </td>
                    <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                      {element.type === "Checkbox" && !!element.field ? (
                        <div>
                          {element.field}
                        </div>
                      ) : null}
                    </td>
                    <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                      <div>
                        [{Math.floor(element.state.x)},{Math.floor(element.state.y)}]
                      </div>
                    </td>
                    <td className="flex whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {index < canvasElements.length - 1 ? (
                        <button
                          className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium px-1"
                          onClick={downLayer(index)}
                          id={index}
                          name={index}
                          value={index}
                        >
                          <ArrowSmDownIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      ) : (
                        <></>
                      )}
                      {index > 0 ? (
                        <button
                          className={classNames(
                            (index !== canvasElements.length - 1) 
                              ? 'ml-1'
                              : '', `bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium px-1`
                          )}
                          onClick={upLayer(index)}
                          id={index}
                          name={index}
                          value={index}
                        >
                          <ArrowSmUpIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      ) : (
                        <></>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        
      </div>
    </>
  );
}
