import { useState, useRef, useEffect, Fragment } from "react";
import { Image, Transformer } from "react-konva";
import { createCanvas } from "canvas";
import useImage from 'use-image';
import JsBarcode from 'jsbarcode';

export const LoadImage = ({
    id,
    url,
    x,
    y,
    width,
    height,
    draggable,
    isSelected,
    onSelect,
    onChange,
    isBarcode,
    onDragMove,
    onDragEnd,
    setCurrentElementWidth,
}) => {
    const imageRef = useRef();
    const trRef = useRef();

    const [image] = useImage(url);

    useEffect(() => {
        if (isSelected) {
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer().batchDraw();
            setCurrentElementWidth(imageRef.current.width());
        }
    }, [isSelected]);
    
    return (
        <Fragment>
            <Image
                ref={imageRef}
                x={x}
                y={y}
                width={width}
                height={height}
                draggable={draggable}
                onDragEnd={(e) => {
                    const node = imageRef.current;
                    onChange({
                        x: node.x(),
                        y: node.y(),
                    });
                    // Llama a la función onDragEnd si está definida
                    if (onDragEnd) {
                        onDragEnd(e);
                    }
                }}
                id={id}
                onClick={onSelect}
                onTap={onSelect}
                image={image}
                onTransformEnd={(e) => {
                    const node = imageRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    let width = Math.max(5, node.width() * scaleX);
                    let height = Math.max(node.height() * scaleY);
                    setCurrentElementWidth(width);
                    if (isBarcode) {
                        width = node.width();
                        height = node.height();
                    }

                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width,
                        height,
                    });
                }}
                // Llama a la función onDragMove si está definida
                onDragMove={onDragMove}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </Fragment>
    );
};


export default function ImageEditor({ imageList, setImageList, onChange }) {
    const [view, setView] = useState("images");
    // Barcode
    const [barcode, setBarcode] = useState("");
    const barcodeTypeList = [
        { key: "128", value: "CODE128" },
        { key: "39",  value: "CODE39" },
        { key: "UPC", value: "UPC" },
        { key: "EAN8", value: "EAN8" },
        { key: "EAN13", value: "EAN13" },
        { key: "MSI", value: "MSI" },
    ];
    const [selectedBarcodeType, setSelectedBarcodeType] = useState(barcodeTypeList[0]);
    const [previewImage, setPreviewImage] = useState(null);
    const validBarcodeWidths = ["1", "2", "3"];
    const validBarcodeHeights = ["50", "100", "200"];
    const [displayValue, setDisplayValue] = useState(false);
    const [barcodeWidth, setBarcodeWidth] = useState(validBarcodeWidths[1]);
    const [barcodeHeight, setBarcodeHeight] = useState(validBarcodeHeights[1]);
    // Error message
    const [message, setMessage] = useState(null);
    // Image sizes in canvas
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(200);

    useEffect(() => {
        try {
            if (barcode !== null && barcode !== "" && selectedBarcodeType !== null && !!selectedBarcodeType?.value) {
                setMessage(null);
                var canvas = createCanvas();
                JsBarcode(canvas, barcode, {
                    format: selectedBarcodeType.value,
                    width: barcodeWidth,
                    height: barcodeHeight,
                    displayValue: displayValue,
                    flat: true,
                    margin: 0
                });
                setPreviewImage({
                    url: canvas.toDataURL(),
                    width: canvas.width,
                    height: canvas.height
                });
                setWidth(canvas.width ?? "");
                setHeight(canvas.height ?? "");
            } else {
                setPreviewImage(null);
                setMessage("Please enter a valid barcode value");
            }
        } catch (error) {
            setPreviewImage(null);
            setMessage(error);
        }
    }, [barcode, selectedBarcodeType, barcodeWidth, barcodeHeight, displayValue]);

    const addImageToCanvas = (image) => () => {
        onChange({
            id: Date.now().toString(),
            type: "image",
            draggable: true,
            isDynamic: false,
            state: {
                isDragging: false,
                x: 0,
                y: 0,
                rotation: 0,
                url: image.url,
                width: image.width,
                height: image.height,
            }
        });
    }

    const addBarcodeToCanvas = (barcodeImage) => () => {
        onChange({
            id: Date.now().toString(),
            type: "barcode",
            barcodeValue: barcode,
            barcodeType: selectedBarcodeType.key,
            barcodeDisplayValue: displayValue,
            barcodeWidth: barcodeWidth,
            barcodeHeight: barcodeHeight,
            draggable: true,
            isDynamic: false,
            state: {
                isDragging: false,
                x: 0,
                y: 0,
                rotation: 0,
                url: barcodeImage.url,
                width: width,
                height: height,
            }
        });
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const imageData = reader.result.split(',')[1];
            const url = 'data:image/png;base64,' + imageData;
            let imgWidth = 200;
            let imgHeight = 200;
            const img = { url, width: imgWidth, height: imgHeight };
            if (view === "images") {
                setImageList([...imageList, img]);
            }
        }
    }

    const handleBarcodeTypeChange = (e) => {
        const barcodeType = barcodeTypeList.find((type) => type.value === e.target.value);
        setSelectedBarcodeType(barcodeType);
    }

    const resetImageSize = () => {
        if (view === "images") {
            setWidth(200);
            setHeight(200);
        } else {
            setWidth(200);
            setHeight(200);
            setBarcodeWidth(validBarcodeWidths[1]);
            setBarcodeHeight(validBarcodeHeights[1]);
        }
    }

    const changeView = (view) => () => {
        setView(view);
        resetImageSize();
    }

    return (
        <div className="w-full ">
            <h1>
                {view === "images" ? (
                    <label>Image panel</label>
                ) : (
                    <label>Barcode panel</label>
                )}
            </h1>

            {view === "images" && (
                <label className="block text-gray-700 text-sm font-bold mb-4 mt-2 pb-4 mb-2 border-b border-slate-200">
                    Upload an image:
                    <input type="file" className="hidden" accept="image/jpeg, image/png, image/gif" onChange={(e) => handleImageUpload(e)} />
                    <span className="ml-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg cursor-pointer">
                        Choose file
                    </span>
                </label>
            )}

            <div className="grid grid-cols-2 gap-4 pb-4 mb-2 border-b border-stalte-200 mt-4">
                <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={changeView("images")}>
                    Images
                </button>
                <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={changeView("barcodes")}>
                    Barcodes
                </button>
            </div>
            {view === "images" ? (
                <></>
            ) : (
                <div className="mb-4 pb-4">
                    <fieldset>
                        <div className="mt-2 -space-y-px rounded-md bg-white">
                            <div className="flex -space-x-px">
                                <div className="w-full">
                                    <label htmlFor="width" className="block text-gray-700 text-sm font-bold mb-2 mt-1">
                                        Width
                                    </label>
                                    <select
                                        className="w-full h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                        defaultValue={barcodeWidth}
                                        onChange={(e) => setBarcodeWidth(e.target.value)}
                                    >
                                        {validBarcodeWidths.map((width, i) => (
                                            <option key={i} value={width}>
                                                {width}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="height" className="block text-gray-700 text-sm font-bold mb-2 mt-1">
                                        Height
                                    </label>
                                    <select
                                        className="w-full h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                        defaultValue={barcodeHeight}
                                        onChange={(e) => setBarcodeHeight(e.target.value)}
                                    >
                                        {validBarcodeHeights.map((height, i) => (
                                            <option key={i} value={height}>
                                                {height}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="width" className="block text-gray-700 text-sm font-bold mb-2 mt-1">
                                        Display value
                                    </label>
                                    <input
                                        id="display-value"
                                        aria-describedby="display-value-description"
                                        name="display-value"
                                        type="checkbox"
                                        className="ml-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        defaultChecked={displayValue}
                                        onChange={(e) => setDisplayValue(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            )}

            {(view === "images" ? (
                <div className="grid grid-cols-2 gap-4 h-screen overflow-y-auto max-h-80vh">
                    {imageList.map((image, index) => (
                        <div key={index} className="w-full aspect-w-1 aspect-h-1">
                            <img
                                className="object-cover w-full focus:border-blue-500 cursor-pointer"
                                src={image.url}
                                alt={"Image " + index}
                                onClick={addImageToCanvas(image)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    <div>
                        <label htmlFor="barcode" className="block text-sm font-medium leading-6 text-gray-900">
                            Barcode:
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <input
                                type="text"
                                name="barcode"
                                id="barcode"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Enter barcode"
                                autoComplete="off"
                                defaultValue={barcode}
                                onChange={(event) => setBarcode(event.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <label htmlFor="barcode-type" className="sr-only">
                                    Type
                                </label>
                                <select
                                    id="barcode-type"
                                    name="barcode-type"
                                    className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                    defaultValue={selectedBarcodeType.value}
                                    onChange={handleBarcodeTypeChange}
                                >
                                    {barcodeTypeList.map((type, index) => (
                                        <option key={index} value={type.value}>{type.value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        {previewImage && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Image Preview:
                                </label>
                                <img
                                    className="object-cover w-full focus:border-blue-500 cursor-pointer"
                                    src={previewImage.url}
                                    alt="Barcode preview"
                                    onClick={addBarcodeToCanvas(previewImage)}
                                />
                            </div>
                        )}
                        {message && (
                            <label className="text-red-500">{message}</label>
                        )}
                        {barcode !== "" && !message && (
                            <label className="text-black-500">Click to add</label>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}