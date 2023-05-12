import { useState, useRef, useEffect, Fragment } from "react";
import { Image, Transformer } from "react-konva";
import useImage from 'use-image';

export const LoadImage = ({
    id,
    url,
    x,
    y,
    width,
    height,
    draggable,
    onDragStart,
    onDragEnd,
    isSelected,
    onSelect,
    onChange
}) => {
    const imageRef = useRef();
    const trRef = useRef();

    const [image] = useImage(url);

    useEffect(() => {
        if (isSelected) {
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer().batchDraw();
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
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                id={id}
                onClick={onSelect}
                onTap={onSelect}
                image={image}

                onTransformEnd={(e) => {
                    const node = imageRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
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

export default function ImageEditor({ imageList, setImageList, barcodeImageList, setBarcodeImageList, setCanvasElements }) {
    const [view, setView] = useState("images");

    const addImageToCanvas = (image) => () => {
        setCanvasElements((prev) => {
            const newElement = {
                id: Date.now().toString(),
                type: "image",
                draggable: true,
                isDynamic: false,
                state: {
                    isDragging: false,
                    x: 200,
                    y: 200,
                    url: image.url,
                    width: image.width,
                    height: image.height,
                }
            };
            return [...prev, newElement];
        });
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const imageData = reader.result.split(',')[1];
            const url = 'data:image/png;base64,' + imageData;
            const img = { url, width: null, height: null };
            if (view === "images") {
                setImageList([ ...imageList, img ]);
            } else {
                setBarcodeImageList([ ...barcodeImageList, img ]);
            }
        }
    }

    const changeView = (view) => () => {
        setView(view);
    }

    return (
        <div className="w-full ">
            <h1>
                { view === "images" ? "Image panel" : "Barcode panel" }
            </h1>

            <label className="block text-gray-700 text-sm font-bold mb-4 mt-2 pb-4 mb-2 border-b border-slate-200">
                { view === "images" ? "Upload an image:" : "Upload a barcode image:" }
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                <span className="ml-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg cursor-pointer">
                    Choose file
                </span>
            </label>

            <div className="grid grid-cols-2 gap-4 pb-4 mb-2 border-b border-stalte-200">
                <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={changeView("images")}>
                    Images
                </button>
                <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={changeView("barcodes")}>
                    Barcodes
                </button>
            </div>

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
                <div className="grid grid-cols-2 gap-4 h-screen overflow-y-auto max-h-80vh">
                    {barcodeImageList.map((image, index) => (
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
            ))}
        </div>
    )
}