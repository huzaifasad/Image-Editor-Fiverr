import React, { useState, useEffect, useRef } from 'react';

export default function ImageEditor() {
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [grayscale, setGrayscale] = useState(0);
    const [sharpenLevel, setSharpenLevel] = useState(10); // Adjust sharpening level
    const [uploadProgress, setUploadProgress] = useState(0);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil'); // pencil or eraser

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // Apply filters
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
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sharpenedData = sharpen(imageData, sharpenLevel); // Adjust sharpening level
                ctx.putImageData(sharpenedData, 0, 0);

                setPreviewImage(canvas.toDataURL());
            };
            img.src = image;
        }
    }, [image, contrast, brightness, opacity, grayscale, sharpenLevel]); // Include sharpenLevel in dependencies

    // Function to apply sharpening
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

                // Sum the values in a 3x3 kernel
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

                // Calculate the average color
                r /= count;
                g /= count;
                b /= count;
                a /= count;

                // Apply sharpening
                const oldR = (data[idx * 4] + data[idx * 4 + 3]) / 2; // Average old and new values
                const oldG = (data[idx * 4 + 1] + data[idx * 4 + 3]) / 2;
                const oldB = (data[idx * 4 + 2] + data[idx * 4 + 3]) / 2;
                const newR = oldR + level * (oldR - r);
                const newG = oldG + level * (oldG - g);
                const newB = oldB + level * (oldB - b);

                // Clamp values
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

    const handleCanvasMouseDown = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        if (tool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
        } else if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 20;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleCanvasMouseUp = () => {
        setIsDrawing(false);
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
                <div className='border border-2 h-screen'>

                    <div>
                        <label>Contrast:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={handleContrastChange}
                        />
                    </div>

                    <div>
                        <label>Brightness:</label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={handleBrightnessChange}
                        />
                    </div>

                    <div>
                        <label>Opacity:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={handleOpacityChange}
                        />
                    </div>

                    <div>
                        <label>Grayscale:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={grayscale}
                            onChange={handleGrayscaleChange}
                        />
                    </div>

                    <div>
                        <label>Sharpening Level:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sharpenLevel}
                            onChange={handleSharpenLevelChange}
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
                </div>
            </div>
        </div>
    )
}
