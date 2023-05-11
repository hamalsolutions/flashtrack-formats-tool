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

export default function ImageEditor({ imageList, setImageList, setCanvasElements }) {
    const addImageToCanvas = (image) => () => {
        setCanvasElements((prev) => {
            const newElement = {
                id: Date.now().toString(),
                type: "image",
                draggable: true,
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
            setImageList([
                ...imageList,
                {
                    url,
                    selected: false,
                    width: null,
                    height: null,
                },
            ]);
        }
    }

    return (
        <div className="w-full ">
            <h1>Image panel</h1>
            <label className="block text-gray-700 text-sm font-bold mb-4 mt-2">
                Upload an image:
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                <span className="ml-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg cursor-pointer">
                    Choose file
                </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
                {imageList.map((image, index) => (
                    <div key={index} className="w-full aspect-w-1 aspect-h-1">
                        <img
                            className="object-cover w-full h-full focus:border-blue-500 cursor-pointer"
                            src={image.url}
                            alt={"Image " + index}
                            onClick={addImageToCanvas(image)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}