import { useState } from 'react';

export const inchesToPixels = 88.088012;
export const centimetersToPixels = 37.795280352161;

export default function SizeLabelEditor({
  initialW,
  initialH,
  initialRotation,
  onChangeW,
  onChangeH,
  onChangeRotation,
  selectedMetric,
  setSelectedMetric,
}) {
  const [metric, setMetric] = useState(selectedMetric);
  const [wVal, setWVal] = useState(initialW);
  const [hVal, setHVal] = useState(initialH);
  const [rotationVal, setRotationVal] = useState(initialRotation);

  const widthlabel = (e) => {
    let val;
    if (metric === "in") {
      val = e.target.value * inchesToPixels;
    } else {
      val = e.target.value * centimetersToPixels;
    }
    setWVal(e.target.value);
    onChangeW(val);
  };

  const heightlabel = (e) => {
    let val;
    if (metric === "in") {
      val = e.target.value * inchesToPixels;
    } else {
      val = e.target.value * centimetersToPixels;
    }
    setHVal(e.target.value);
    onChangeH(val);
  };

  const handleRotation = (event) => {
    setRotationVal(event.target.value);
    onChangeRotation(event.target.value);
  }

  const handleMetric = (event) => {
    if (event.target.value === "in") {
      onChangeH(hVal * inchesToPixels);
      onChangeW(wVal * inchesToPixels);
    } else {
      onChangeH(hVal * centimetersToPixels);
      onChangeW(wVal * centimetersToPixels);
    }
    setMetric(event.target.value);
    setSelectedMetric(event.target.value);
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
            defaultValue={wVal}
          />
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
            defaultValue={hVal}
          />
        </div>
        <br></br>
        <div className="relative flex">
          <p>Rotation:&nbsp;&nbsp; </p>
          <select onChange={handleRotation} className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400   dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800">
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="270">270°</option>
          </select>
        </div>
        <br></br>
        <div className="relative flex">
          <p>Metric:&nbsp;&nbsp; </p>
          <select onChange={handleMetric} className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400   dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800">
            <option value="in">In</option>
            <option value="cm">cm</option>
          </select>
        </div>
      </div>
    </>
  );
}
