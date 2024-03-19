import React, { useState, useEffect, useRef } from 'react';
import { FaUndo, FaRedo, FaDownload, FaPrint } from 'react-icons/fa';
import { FaPencilAlt, FaEraser } from 'react-icons/fa';

export default function ImageEditor() {
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(0);
    const [grayscale, setGrayscale] = useState(0);
    const [sharpness, setSharpness] = useState(0);
    const [extrasharp, setExtrasharp] = useState(0);
    const [lineThickness, setLineThickness] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [currentSize, setCurrentSize] = useState(2);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [originalImage, setOriginalImage] = useState(null);
    const imageCanvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const [firstImageLoad, setFirstImageLoad] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level
    const [drawingContextSettings, setDrawingContextSettings] = useState({
        strokeStyle: '#000000',
        lineWidth: 2,
        globalCompositeOperation: 'source-over'
    });
    const [drawings, setDrawings] = useState([]); // Store drawings separately
    const saveDrawingContextSettings = () => {
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        setDrawingContextSettings({
            strokeStyle: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
            globalCompositeOperation: ctx.globalCompositeOperation
        });
    };

    // Function to restore drawing context settings
    const restoreDrawingContextSettings = () => {
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        const { strokeStyle, lineWidth, globalCompositeOperation } = drawingContextSettings;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.globalCompositeOperation = globalCompositeOperation;
    };

    const handleZoomChange = (e) => {
        setZoomLevel(parseInt(e.target.value)); // Update zoom level based on the range input value
    };
    
    useEffect(() => {
        if (image) {
            if (firstImageLoad) {
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
                setFirstImageLoad(false);
            }

            setOriginalImage(image);

            const imageCanvas = imageCanvasRef.current;
            const ctx = imageCanvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;

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
                if (sharpness !== 0) {
                    applySharpening(ctx, imageCanvas.width, imageCanvas.height, sharpness);
                }
        
                if (extrasharp !== 0) {
                    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
                    const sharpenedData = extrashapfunction(imageData, extrasharp);
                    ctx.putImageData(sharpenedData, 0, 0);
                }
                redrawDrawings()

                setPreviewImage(imageCanvas.toDataURL());
            };
            img.src = image;
        }
    }, [image, contrast, brightness, opacity, grayscale, sharpness, extrasharp, firstImageLoad]);
    const redrawDrawings = () => {
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');

        drawings.forEach(({ x, y }, index) => {
            if (index === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        });
    };
    const applySharpening = (ctx, width, height, sharpness) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const factor = sharpness / 50;

        const weights = [
            -1, -1, -1,
            -1, 9 + factor, -1,
            -1, -1, -1
        ];

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result);
            setContrast(100);
            setBrightness(100);
            setOpacity(0);
            setGrayscale(0);
            setSharpness(0);
            setExtrasharp(0);
            setFirstImageLoad(true);

            const imageCanvas = imageCanvasRef.current;
            const ctx = imageCanvas.getContext('2d');
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

            if (originalImage) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = originalImage;
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        } else {
            setImage(null);
        }
    };

    const handleContrastChange = (e) => {
        setContrast(e.target.value);
    };

    const handleBrightnessChange = (e) => {
        setBrightness(e.target.value);
    };

    const handleOpacityChange = (e) => {
        const newOpacity = e.target.value;
        const invertedOpacity = 100 - newOpacity;
        setOpacity(invertedOpacity);
    };

    const handleGrayscaleChange = (e) => {
        setGrayscale(e.target.value);
    };

    const handleSharpnessChange = (e) => {
        setSharpness(e.target.value);
    };

    const handleextraSharpenChange = (e) => {
        setExtrasharp(e.target.value);
    };

    const handleToolChange = (e) => {
        setTool(e.target.value);
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

  

    const handleReset = () => {
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
        setImage(originalImage);
        setZoomLevel(100);
       
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Clear the drawing canvas
    
        const imageCanvas = imageCanvasRef.current;
        const imageCtx = imageCanvas.getContext('2d');
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    
        if (originalImage) {
            const img = new Image();
            img.onload = () => {
                imageCtx.drawImage(img, 0, 0);
            };
            img.src = originalImage;
        }
    
        // Clear drawings state
        setDrawings([]);
    };
    

    const handleDownload = () => {
        const imageCanvas = imageCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        
        // Adjust canvas size based on zoom level
        const canvasWidth = imageCanvas.width * (zoomLevel / 100);
        const canvasHeight = imageCanvas.height * (zoomLevel / 100);
        
        const mergedCanvas = document.createElement('canvas');
        const mergedCtx = mergedCanvas.getContext('2d');
    
        mergedCanvas.width = canvasWidth;
        mergedCanvas.height = canvasHeight;
    
        mergedCtx.drawImage(imageCanvas, 0, 0, canvasWidth, canvasHeight);
        mergedCtx.drawImage(drawingCanvas, 0, 0, canvasWidth, canvasHeight);
    
        const link = document.createElement('a');
        link.download = 'edited_image.png';
        link.href = mergedCanvas.toDataURL();
        link.click();
    };
    

    const handlePrint = () => {
        const imageCanvas = imageCanvasRef.current;
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write('<img src="' + imageCanvas.toDataURL() + '" style="width:100%; height:auto;">');
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
        };
    };

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const drawingCanvas = drawingCanvasRef.current;
            const ctx = drawingCanvas.getContext('2d');
            setRedoStack([...redoStack, ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)]);
            const lastAction = undoStack.pop();
            ctx.putImageData(lastAction, 0, 0);
            setUndoStack([...undoStack]);
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const drawingCanvas = drawingCanvasRef.current;
            const ctx = drawingCanvas.getContext('2d');
            setUndoStack([...undoStack, ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)]);
            const lastAction = redoStack.pop();
            ctx.putImageData(lastAction, 0, 0);
            setRedoStack([...redoStack]);
        }
    };
    const draw = (e) => {
        if (!isDrawing) return;
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();

        // Store drawings for redrawing after applying filters
        setDrawings([...drawings, { x, y }]);
    };

    // Function to start drawing
    const startDrawing = (e) => {
        setIsDrawing(true);
        const drawingCanvas = drawingCanvasRef.current;
        const ctx = drawingCanvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    // Function to stop drawing
    const endDrawing = () => {
        setIsDrawing(false);
    };
// Function to handle mouse down event on the canvas
 const handleCanvasMouseDown = (e) => {
        if (tool === 'pencil') {
            startDrawing(e);
        } else if (tool === 'eraser') {
            setIsDrawing(true);
        }
    };

    // Function to handle mouse move event on the canvas
    const handleCanvasMouseMove = (e) => {
        if (tool === 'pencil') {
            draw(e);
        } else if (tool === 'eraser') {
            erase(e);
        }
    };

    // Function to handle mouse up event on the canvas
    const handleCanvasMouseUp = () => {
        if (tool === 'pencil') {
            endDrawing();
        } else if (tool === 'eraser') {
            setIsDrawing(false);
        }
    };
const erase = (e) => {
    if (!isDrawing) return;
    const drawingCanvas = drawingCanvasRef.current;
    const ctx = drawingCanvas.getContext('2d');
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.clearRect(x, y, currentSize, currentSize);
};
// Function to handle mouse up event on the canvas

    return (
        <div className='h-screen w-screen flex bg-[#00ffff]'>
        <div className='w-[72%] h-screen px-2'>
            <div className='h-[97%]  w-[97%] flex items-center justify-center overflow-scroll mt-2'>
              <canvas
    key={image}
    className="relative overflow-hidden bg-[#fff]"
    ref={(canvas) => {
        imageCanvasRef.current = canvas;
        drawingCanvasRef.current = canvas;
    }}
    onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: '' }}

/>

            </div>
        </div>
            <div className='w-[24%] h-screen'>
                <div className=' h-full '>
                <div>
                    
                        <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Line Thickness</label>
                   
                        <div className="flex justify-between px-2 top-0">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index + 1} className="text-xs">{index + 1} |</span>
    ))}
</div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={extrasharp}
                            onChange={handleextraSharpenChange}
                            className="custom-range ml-2 w-full h-4"                         
 style={{ height: '6px' }}               
 
 
 />


                    </div>
                    
                    <div>
                        <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Range</label>
                     
                        <div className="flex justify-between px-2 top-0">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index - 7} className="text-[0.6rem]">{index - 7} |</span>
    ))}
</div>  
                        <input
                            type="range"
                            min="-200"
                            max="200"
                            value={sharpness}
                            onChange={handleSharpnessChange}
                            
                            className="custom-range ml-2 w-full h-4"             
 style={{ height: '6px' }}           />
                    </div>
                    <div>
                        <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Opacity</label>
                      
                        <div className="flex justify-between px-2 top-0">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index + 1} className="text-xs">{index + 1} |</span>
    ))}
</div>

                      
                        <input
    type="range"
    min="0"
    max="100"
    value={100 - opacity} // Invert the value for the slider
    onChange={handleOpacityChange}
    className="custom-range ml-2 w-full h-4" // Adjust the height here
    style={{ height: '6px' }} // Adjust the width here
/>
                    </div>
                    <div className=''>
                        <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Contrast</label>
                     
                        <div className="flex justify-between px-2 top-0">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index - 7} className="text-[0.6rem]">{index - 7} |</span>
    ))}
</div>  
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={handleContrastChange}
                            className="custom-range ml-2 w-full"   
                            style={{ height: '6px' }}                         />
                       
                    </div>

                    <div>
         
                        <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Brightness</label>
                      
                        <div className="flex justify-between px-2 top-0">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index - 7} className="text-[0.6rem]">{index - 7} |</span>
    ))}
</div>        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={handleBrightnessChange}
                            className="custom-range ml-2 w-full"   
                            style={{ height: '6px' }}  
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
                    <label className='flex items-center  text-gray-700 font-bold rounded-md  px-2 transform hover:scale-105 transition-transform duration-300'>Zoom</label>
                    <div className="px-1 absolute w-[70%] ">
    {Array.from({ length: 15 }, (_, index) => (
        <span key={index - 7} className="text-[0.6rem] relative  mr-1">{index - 7} |</span>
    ))}
</div>


    <input
        type="range"
        min="10"
        max="200"
        value={zoomLevel}
        onChange={handleZoomChange}
        className="custom-range ml-2 w-[70%]"
        style={{ height: '6px' }}
    />
      <button className="ml-2 mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors" onClick={handleReset}>Reset</button>

                    </div>
                    <div className="relative inline-block">
  {/* <label className='items-center mt-2 justify-center text-gray-700 font-bold rounded-md py-1 px-2 transform hover:scale-105 transition-transform duration-300' >Drawing Tools</label> */}
</div>
<div className="relative inline-block">
<div className="relative inline-block">
  <button
    className={`mt-2 bg-gray-200 text-gray-700 px-8 py-1 rounded-md hover:bg-gray-300 transition-colors border border-gray-300 ${
      tool === 'pencil' ? 'bg-blue-400 text-white' : ''
    }`}
    onClick={() => setTool('pencil')}
  >
    Pencil
  </button>
  <button
    className={`ml-2 mt-2 bg-gray-200 text-gray-700 px-8 py-1 rounded-md hover:bg-gray-300 transition-colors border border-gray-300 ${
      tool === 'eraser' ? 'bg-blue-400 text-white' : ''
    }`}
    onClick={() => setTool('eraser')}
  >
    Eraser
  </button>
</div>

</div>





                    <div>
                        {/* <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-xs py-1 px-2 transform hover:scale-105 transition-transform duration-300'>Color</label> */}
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className='w-full mt-1'
                        />
                    </div>

                    <div>
                        <label className='flex items-center justify-center text-gray-700 font-bold rounded-md shadow-xs py-1 px-2 transform hover:scale-105 transition-transform duration-300'>Size</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={currentSize}
                            onChange={handleSizeChange}
 className="w-full"                
 style={{ height: '6px' }}           />
                    </div>

                    <label className="flex items-center justify-center text-gray-700 font-bold rounded-md   transform hover:scale-105 transition-transform duration-300">
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
