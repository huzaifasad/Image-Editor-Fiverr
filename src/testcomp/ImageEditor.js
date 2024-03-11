import React, { useState, useEffect, useRef } from 'react';

export default function ImageEditor() {
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [grayscale, setGrayscale] = useState(0);
    const [sharpness, setSharpness] = useState(0);
    const [lineThickness, setLineThickness] = useState(2);
    const[extrasharp,setetrasharp]=useState(0)
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentSize, setCurrentSize] = useState(2);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                const isNegative = contrast < 100;
                const filter = `
                    contrast(${Math.abs(contrast)}%)
                    brightness(${brightness}%)
                    opacity(${opacity}%)
                    grayscale(${grayscale}%)
                    ${isNegative ? 'invert(100%)' : ''}
                `;
                ctx.filter = filter;
                ctx.drawImage(img, 0, 0);

                // Apply sharpening
                applySharpening(ctx, canvas.width, canvas.height, sharpness);

                setPreviewImage(canvas.toDataURL());
            };
            img.src = image;
        }
    }, [image, contrast, brightness, opacity, grayscale, sharpness]);

    // Apply sharpening to the canvas context
    const applySharpening = (ctx, width, height, sharpness) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const factor = sharpness / 50;

        const weights = [
            -1, -1, -1,
            -1, 9 + factor, -1,
            -1, -1, -1
        ]; // Kernel for sharpening (unsharp mask)

        for (let i = 0; i < data.length; i += 4) {
            let sumRed = 0;
            let sumGreen = 0;
            let sumBlue = 0;

            for (let j = 0; j < weights.length; j++) {
                const k = i + j * 4;
                sumRed += data[k] * weights[j];
                sumGreen += data[k + 1] * weights[j];
                sumBlue += data[k + 2] * weights[j];
            }

            data[i] = sumRed;
            data[i + 1] = sumGreen;
            data[i + 2] = sumBlue;
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleContrastChange = (e) => {
        setContrast(e.target.value);
    };

    const handleBrightnessChange = (e) => {
        setBrightness(e.target.value);
    };

    const handleOpacityChange = (e) => {
        setOpacity(e.target.value);
    };

    const handleGrayscaleChange = (e) => {
        setGrayscale(e.target.value);
    };

    const handleToolChange = (e) => {
        setTool(e.target.value);
    };

    const handleSharpnessChange = (e) => {
        setSharpness(e.target.value);
    };

    const handleLineThicknessChange = (e) => {
        setLineThickness(e.target.value);
    };

    const handleColorChange = (color) => {
        setCurrentColor(color);
    };

    const handleSizeChange = (e) => {
        setCurrentSize(e.target.value);
    };

    const handleCanvasMouseDown = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = tool === 'pencil' ? currentColor : '#ffffff';
            ctx.lineWidth = tool === 'eraser' ? lineThickness * 2 : currentSize;
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const handleCanvasMouseUp = () => {
        if (tool === 'pencil' || tool === 'eraser') {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            setUndoStack([...undoStack, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
            setRedoStack([]); // Clear redo stack when new action is performed
        }
    };

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            setRedoStack([...redoStack, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
            const lastAction = undoStack.pop();
            ctx.putImageData(lastAction, 0, 0);
            setUndoStack([...undoStack]);
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            setUndoStack([...undoStack, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
            const lastAction = redoStack.pop();
            ctx.putImageData(lastAction, 0, 0);
            setRedoStack([...redoStack]);
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'edited_image.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className='h-screen w-screen flex bg-[#fff666]'>
            <div className='w-[75%] px-2'>
                <div className='bg-[#fff] text-5xl border border-2 h-full flex items-center justify-center'>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        style={{ border: '1px solid black', cursor: 'crosshair' }}
                    />
                </div>
            </div>
            <div className='w-[25%]'>
                <div className='border border-2 h-screen '>

                    <div className=''>
                        <label className='flex'>Contrast:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={handleContrastChange}
                        />
                       
                    </div>

                    <div>
                        <label className='flex'>Brightness:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={handleBrightnessChange}
                        />
                    </div>

                    <div>
                        <label className='flex'>Opacity:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={handleOpacityChange}
                        />
                    </div>

                    <div>
                        <label className='flex'>Grayscale:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={grayscale}
                            onChange={handleGrayscaleChange}
                        />
                    </div>

                    <div>
                        <label className='flex'>Sharpness:</label>
                        <input
                            type="range"
                            min="-200"
                            max="200"
                            value={sharpness}
                            onChange={handleSharpnessChange}
                        />
                    </div>

                    <div>
                        <label className='flex'>Line Thickness:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineThickness}
                            onChange={handleLineThicknessChange}
                        />
                    </div>

                    <div>
                        <label>Tool:</label>
                        <select value={tool} onChange={handleToolChange}>
                            <option value="pencil">Pencil</option>
                            <option value="eraser">Eraser</option>
                        </select>
                    </div>

                    <div>
                        <label>Color:</label>
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={currentSize}
                            onChange={handleSizeChange}
                        />
                    </div>

                    <input type="file" onChange={handleImageChange} />
                    {previewImage && <img src={previewImage} alt="Uploaded" style={{ display: 'none' }} />}
                    <button onClick={handleDownload}>Download</button>
                    {/* <progress value={uploadProgress} max="100" /> */}
                    <button onClick={handleUndo}>Undo</button>
                    <button onClick={handleRedo}>Redo</button>
                </div>
            </div>
        </div>
    )
}
