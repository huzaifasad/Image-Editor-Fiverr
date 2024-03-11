import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Apps = () => {
  const [image, setImage] = useState(null);
  const [contrast, setContrast] = useState(100);
  const [lineThickness, setLineThickness] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [range, setRange] = useState(50);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingSize, setDrawingSize] = useState(5);
  const [drawingOpacity, setDrawingOpacity] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(null);
  const [lastY, setLastY] = useState(null);

  useEffect(() => {
    if (image) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        applyFilters(ctx);
      };
      img.src = image;
    }
  }, [image, contrast, lineThickness, opacity, range]);

  const applyFilters = (ctx) => {
    ctx.filter = `contrast(${contrast}%)`;
    ctx.globalAlpha = opacity;
    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.filter = 'none';
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrawing = (event) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = drawingSize;
    ctx.globalAlpha = drawingOpacity;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.closePath();
    ctx.stroke();
    setLastX(event.offsetX);
    setLastY(event.offsetY);
  };

  const startDrawing = (event) => {
    setIsDrawing(true);
    setLastX(event.offsetX);
    setLastY(event.offsetY);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastX(null);
    setLastY(null);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sketch App</h1>
      <div className="flex justify-center items-center mb-4">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      {image && (
        <>
          <div className="flex justify-center items-center mb-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={handleDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              style={{ border: '1px solid #000' }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contrastSlider" className="block font-semibold mb-2">
              Contrast:
            </label>
            <Slider id="contrastSlider" value={contrast} onChange={setContrast} />
          </div>
          <div className="mb-4">
            <label htmlFor="lineThicknessSlider" className="block font-semibold mb-2">
              Line Thickness:
            </label>
            <Slider id="lineThicknessSlider" value={lineThickness} onChange={setLineThickness} />
          </div>
          <div className="mb-4">
            <label htmlFor="opacitySlider" className="block font-semibold mb-2">
              Opacity:
            </label>
            <Slider id="opacitySlider" value={opacity} onChange={setOpacity} />
          </div>
          <div className="mb-4">
            <label htmlFor="rangeSlider" className="block font-semibold mb-2">
              Range:
            </label>
            <Slider id="rangeSlider" value={range} onChange={setRange} />
          </div>
          <div className="mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              {showColorPicker ? 'Close Color Picker' : 'Open Color Picker'}
            </button>
            {showColorPicker && (
              <div className="absolute mt-2">
                <SketchPicker color={drawingColor} onChange={(color) => setDrawingColor(color.hex)} />
              </div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="drawingSizeSlider" className="block font-semibold mb-2">
              Drawing Size:
            </label>
            <Slider id="drawingSizeSlider" value={drawingSize} onChange={setDrawingSize} />
          </div>
          <div className="mb-4">
            <label htmlFor="drawingOpacitySlider" className="block font-semibold mb-2">
              Drawing Opacity:
            </label>
            <Slider id="drawingOpacitySlider" value={drawingOpacity} onChange={setDrawingOpacity} />
          </div>
          <div className="mb-4">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={clearCanvas}
            >
              Clear Canvas
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Apps;
