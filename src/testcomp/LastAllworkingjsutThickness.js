import React, { useState, useEffect, useRef } from 'react';

export default function ImageEditor() {
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [grayscale, setGrayscale] = useState(0);
    const [sharpenLevel, setSharpenLevel] = useState(0);
    const [lineThickness, setLineThickness] = useState(2);
    const [uploadProgress, setUploadProgress] = useState(0);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil'); // pencil or eraser
    const [currentColor, setCurrentColor] = useState('#000000');
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

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sharpenedData = sharpen(imageData, sharpenLevel);
                ctx.putImageData(sharpenedData, 0, 0);

                setPreviewImage(canvas.toDataURL());
            };
            img.src = image;
        }
    }, [image, contrast, brightness, opacity, grayscale, sharpenLevel]);

    function sharpen(imageData, level) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const buffer = new Uint32Array(data.buffer);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const cx = x + kx;
                        const cy = y + ky;

                        if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                            const offset = cy * width + cx;
                            const pixel = buffer[offset];
                            r += pixel & 0xff;
                            g += (pixel >> 8) & 0xff;
                            b += (pixel >> 16) & 0xff;
                            a += (pixel >> 24) & 0xff;
                            count++;
                        }
                    }
                }

                r /= count;
                g /= count;
                b /= count;
                a /= count;

                const oldR = (data[idx * 4] + data[idx * 4 + 3]) / 2;
                const oldG = (data[idx * 4 + 1] + data[idx * 4 + 3]) / 2;
                const oldB = (data[idx * 4 + 2] + data[idx * 4 + 3]) / 2;
                const newR = oldR + level * (oldR - r);
                const newG = oldG + level * (oldG - g);
                const newB = oldB + level * (oldB - b);

                data[idx * 4] = Math.max(0, Math.min(255, newR));
                data[idx * 4 + 1] = Math.max(0, Math.min(255, newG));
                data[idx * 4 + 2] = Math.max(0, Math.min(255, newB));
            }
        }

        return imageData;
    }

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

    const handleSharpenLevelChange = (e) => {
        setSharpenLevel(e.target.value);
    };

    const handleLineThicknessChange = (e) => {
        setLineThickness(e.target.value);
    };

    const handleColorChange = (color) => {
        setCurrentColor(color);
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
            ctx.lineWidth = tool === 'eraser' ? lineThickness * 2 : lineThickness;
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
                        <label className='flex'>Sharpening Level:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sharpenLevel}
                            onChange={handleSharpenLevelChange}
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

                    <input type="file" onChange={handleImageChange} />
                    {previewImage && <img src={previewImage} alt="Uploaded" style={{ display: 'none' }} />}
                    <button onClick={handleDownload}>Download</button>
                    <progress value={uploadProgress} max="100" />
                    <button onClick={handleUndo}>Undo</button>
                    <button onClick={handleRedo}>Redo</button>
                </div>
            </div>
        </div>
    )
}
