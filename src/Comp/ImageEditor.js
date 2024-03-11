
import React, { useState, useEffect, useRef } from 'react';
import { FaUndo, FaRedo, FaDownload, FaPrint } from 'react-icons/fa';

export default function ImageEditor() {
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [grayscale, setGrayscale] = useState(0);
    const [sharpness, setSharpness] = useState(0);
    const [extrasharp, setExtrasharp] = useState(0); // Added extra sharpness state
    const [lineThickness, setLineThickness] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentSize, setCurrentSize] = useState(2);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [originalImage, setOriginalImage] = useState(null); // Store original image
    const canvasRef = useRef(null);

    useEffect(() => {
        if (image) {
            setOriginalImage(image); // Store original image when a new image is uploaded

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
    
                // Apply additional sharpening
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sharpenedData = extrashapfunction(imageData, extrasharp);
                ctx.putImageData(sharpenedData, 0, 0);
    
                setPreviewImage(canvas.toDataURL());
            };
            img.src = image;
        }
    }, [image, contrast, brightness, opacity, grayscale, sharpness, extrasharp]);
    

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
    const extrashapfunction = (imageData, level) => {
        // Implementation remains the same
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
    const handleReset = () => {
        // Reset all filters and clear the canvas
        setContrast(100);
        setBrightness(100);
        setOpacity(100);
        setGrayscale(0);
        setSharpness(0);
        setExtrasharp(0);
        setLineThickness(2);
        setCurrentColor('#000000');
        setCurrentSize(2);
        setUndoStack([]);
        setRedoStack([]);
        setImage(originalImage); // Set image back to original
        setPreviewImage(null);
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
    const handlePrint = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        // Open a new window with the canvas image
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write('<img src="' + canvas.toDataURL() + '" style="width:100%; height:auto;">');
        printWindow.document.close();
    
        // After the image has loaded in the new window, trigger print
        printWindow.onload = function() {
            printWindow.print();
        };
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
    const handleextraSharpenChange = (e) => {
        setExtrasharp(e.target.value);
    };
    return (
        <div className='h-screen w-screen flex bg-[#D2DE32]'>
            <div className='w-[75%] px-2'>
                <div className='bg-[#fff] text-5xl   h-full  w-full flex items-center justify-center'>
                <div className='bg-[#fff] text-5xl   h-full w-full flex items-center justify-center'>
    <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{ border: '0px solid black', cursor: 'crosshair', width: '100%', height: '100%' }}
    />
</div>

                </div>
            </div>
            <div className='w-[24%]'>
                <div className=' h-screen '>

                    <div className=''>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-lg py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Contrast:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={handleContrastChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden border border-gray-300 shadow-md"
                        />
                       
                    </div>

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Brightness:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={handleBrightnessChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden"
                        />
                    </div>

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Opacity:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={handleOpacityChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden"
                        />
                    </div>

                    {/* <div>
                        <label className='flex'>Grayscale:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={grayscale}
                            onChange={handleGrayscaleChange}
                        />
                    </div> */}

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Range</label>
                        <input
                            type="range"
                            min="-200"
                            max="200"
                            value={sharpness}
                            onChange={handleSharpnessChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden"
                        />
                    </div>

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Line Thickness</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={extrasharp}
                            onChange={handleextraSharpenChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden"
                                                   />
                    </div>
                    <div className="relative inline-block">
  <label className=' items-center mt-2 justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300' >Drawing Tools:</label>
  <button className=' ml-8 mt-5 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors' onClick={handleReset}>
                        Reset
                    </button>
  <select
    value={tool}
    onChange={handleToolChange}
    className="block appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
  >
    <option value="pencil">Pencil</option>
    <option value="eraser">Eraser</option>
  </select>

</div>



                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Color:</label>
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300'>Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={currentSize}
                            onChange={handleSizeChange}
                            className="appearance-none block w-full h-2 bg-gray-200 rounded-full outline-none overflow-hidden"
                        />
                    </div>

                    <label className="flex items-center justify-center text-gray-700 font-bold rounded-md shadow-md py-2 px-4 transform hover:scale-105 transition-transform duration-300">
    Upload Image
    <input
        type="file"
        onChange={handleImageChange}
        className="hidden"
        style={{ display: 'none' }}
    />
</label>
                    {previewImage && <img src={previewImage} alt="Uploaded" style={{ display: 'none' }} />}
                    <button className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors' onClick={handleDownload}><FaDownload className="mr-2" /> Download</button>
                    {/* <progress value={uploadProgress} max="100" /> */}
                    <button className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors' onClick={handlePrint}>
                        <FaPrint className="mr-2" /> Print
                    </button>
                    <button className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors' onClick={handleUndo}>
                <FaUndo className="mr-2" /> Undo
            </button>                    <button className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors' onClick={handleRedo}>
                <FaRedo className="mr-2" /> Redo
            </button>                </div>
            </div>
        </div>
    )
}
