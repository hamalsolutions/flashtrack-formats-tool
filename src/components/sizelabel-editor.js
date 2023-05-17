import { useState } from 'react';

export default function SizeLabelEditor({
  initialW,
  initialH,
  onChangeW,
  onChangeH,
}) {
  const [wLabel, setWlabel] = useState();
  const [hLabel, setHlabel] = useState();

  const widthlabel = (e) => {
    const val = e.target.value * 88.088012 + 'px';
    setWlabel(val);
    onChangeW(val);
  };

  const heightlabel = (e) => {
    const val = e.target.value * 88.088012 + 'px';
    setHlabel(val);
    onChangeH(val);
  };

  return (
    <>
      <div className="p-3">
        <div className="relative flex">
          <p>Width:&nbsp;&nbsp; </p>
          <input
            type="text"
            id="width-label"
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-1\/4 pl-10 p-2.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800"
            placeholder="width"
            onChange={widthlabel}
          />
          <span className="ml-2">In</span>
        </div>
        <br></br>
        <div className="relative flex">
          <p>Height:&nbsp;&nbsp; </p>
          <input
            type="text"
            id="height-label"
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-1\/4 pl-10 p-2.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800"
            placeholder="height"
            onChange={heightlabel}
          />
        </div>
      </div>
    </>
  );
}
