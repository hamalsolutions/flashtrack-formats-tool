import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/outline';

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
        <table>
          <tr className="ml-1 text-sm font-medium text-gray-700">
            <td></td>
            <td>Type </td>
            <td>Change </td>
          </tr>
          {canvasElements.map((element, index) => (
            <tr>
              <td className="text-sm font-medium text-gray-700">{index + 1}</td>
              <td className="ml-3 min-w-0 flex-1 text-gray-500">
                <button
                  className="text-gray-700 text-sm font-medium px-4 hover:bg-gray-300"
                  onClick={handleSelectObject(element)}
                  id={index}
                  name={index}
                  value={index}
                >
                  {element.type}
                </button>
              </td>
              <td className="flex">
                {index > 0 ? (
                  <button
                    className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium px-4"
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
                {index < canvasElements.length - 1 ? (
                  <button
                    className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium px-4"
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
              </td>
            </tr>
          ))}
        </table>
      </div>
    </>
  );
}
