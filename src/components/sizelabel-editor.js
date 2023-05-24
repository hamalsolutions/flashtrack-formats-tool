import { useState } from 'react';

export default function SizeLabelEditor({
  initialW,
  initialH,
  onChangeW,
  onChangeH,
}) {
  const [wLabel, setWlabel] = useState();
  const [hLabel, setHlabel] = useState();
  const [metric, setMetric] = useState("in");
  const [wVal, setWVal] = useState();
  const [hVal, setHVal] = useState();

  const widthlabel = (e) => {
    let val;
    if(metric==="in")
    {
     val = e.target.value * 88.088012 + 'px';
    }
    else
    {
      val = e.target.value * 37.795280352161 + 'px';
    }
    
    setWlabel(val);
    setWVal(e.target.value);
    onChangeW(val);
  };

  const heightlabel = (e) => {
    let val;
    if(metric==="in")
    {
       val = e.target.value * 88.088012 + 'px';
    }
    else
    {
      val = e.target.value * 37.795280352161 + 'px';
    }
    
    setHlabel(val);
    setHVal(e.target.value);
    onChangeH(val); 
  };

  const handleMetric = (event) => {
    if(event.target.value==="in"){
      setHlabel(hVal * 88.088012 + 'px');
      onChangeH(hVal * 88.088012 + 'px'); 
      setWlabel(wVal * 88.088012 + 'px');
      onChangeW(wVal * 88.088012 + 'px');
    }
    else
    {
      setHlabel(hVal * 37.795280352161 + 'px');
      onChangeH(hVal * 37.795280352161 + 'px'); 
      setWlabel(wVal * 37.795280352161 + 'px');
      onChangeW(wVal * 37.795280352161 + 'px');
    }
    setMetric(event.target.value);
    
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
        <br></br>
        <span >
            <select onChange={handleMetric}  className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400   dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800">
              <option key="0" value="in">In</option>
              <option key="1" value="cm">cm</option>
            </select>
          </span>
      </div>
    </>
  );
}
