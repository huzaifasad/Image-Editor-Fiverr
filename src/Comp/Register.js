import React, { useState, useRef, useEffect } from 'react';

export default function ImageEditor() {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [contrastLevel, setContrastLevel] = useState(100);

  const [selectedTool, setSelectedTool] = useState('pencil');
  const [image, setImage] = useState(null);
  const [opacityLevel, setOpacityLevel] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1); // Initial zoom level (1 = no zoom)
  const [sharpeningLevel, setSharpeningLevel] = useState(0); // Sharpening level (normalized)

  useEffect(() => {
    if (context && originalImageData) {
      applyFilters();
    }
  }, [brightnessLevel, contrastLevel, sharpeningLevel, opacityLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    drawImage();
  }, [zoomLevel, image, context]);
  // ... existing code for other functionalities ...
  const applyFilters = () => {
    const canvas = canvasRef.current;
    const ctx = context;

    if (!originalImageData) return;

    let imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);

    // Apply brightness
    applyBrightness(imageData);

    // Apply contrast
    applyContrast(imageData);

    // Apply sharpening
    applySharpening(imageData);

    // Apply opacity
    applyOpacity(imageData);

    // Draw the image with applied filters
    ctx.putImageData(imageData, 0, 0);
  };
  const applySharpening = () => {
    const canvas = canvasRef.current;
    const ctx = context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // **Sharpening logic based on sharpeningLevel**
    const factor = (259 * (contrastLevel + 255)) / (255 * (259 - contrastLevel));
    const sharpeningFactor = 1 + Math.abs(sharpeningLevel) / 100; // Normalize sharpening level to -1 to 1

    for (let i = 0; i < data.length; i += 4) {
      const difference = data[i] - 128; // Calculate difference from mean (128)

      // Apply contrast adjustment
      const adjustedValue = 128 + (factor * difference);
      data[i] = Math.max(0, Math.min(255, adjustedValue));
      data[i + 1] = Math.max(0, Math.min(255, adjustedValue));
      data[i + 2] = Math.max(0, Math.min(255, adjustedValue));

      // Apply sharpening based on sharpeningLevel
      data[i] += (adjustedValue - 128) * sharpeningFactor;
      data[i + 1] += (adjustedValue - 128) * sharpeningFactor;
      data[i + 2] += (adjustedValue - 128) * sharpeningFactor;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleSharpeningChange = (e) => {
    setSharpeningLevel(parseInt(e.target.value));
    if (context) {
      applySharpening(); // Update image with adjusted sharpening
    }
  };


  const handleZoomChange = (e) => {
    // Parse zoom level to float between 0.1 (minimum zoom) and 5 (maximum zoom)
    const newZoomLevel = Math.max(0.1, Math.min(5, parseFloat(e.target.value)));
    setZoomLevel(newZoomLevel);
  };

  const drawImage = () => {
    if (!context || !image) return;

    const canvas = canvasRef.current;
    const ctx = context;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions based on zoom level
    const scaledWidth = image.width * zoomLevel;
    const scaledHeight = image.height * zoomLevel;

    // Center the image within the canvas
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Draw the image with scaling and centering
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Store the original image data
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setOriginalImageData(originalData);
  };


  
  const handleOpacityChange = (e) => {
    setOpacityLevel(parseInt(e.target.value));
    if (context) {
      applyOpacity();
    }
  };
  
  const applyOpacity = (imageData) => {
    const data = imageData.data;
    const alpha = opacityLevel / 100;

    for (let i = 3; i < data.length; i += 4) {
      data[i] = data[i] * alpha; // Set alpha channel
    }
  };
  const applyContrast = (imageData) => {
    const data = imageData.data;
  
    // Ensure that contrastLevel is initialized before proceeding
    if (contrastLevel === undefined) return;
  
    const contrastFactor = (contrastLevel + 100) / 100;
  
    for (let i = 0; i < data.length; i += 4) {
      data[i] = ((data[i] / 255 - 0.5) * contrastFactor + 0.5) * 255;
      data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrastFactor + 0.5) * 255;
      data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrastFactor + 0.5) * 255;
    }
  };
  const handleContrastChange = (e) => {
    // Set contrast level between -100 (negative image) and 100 (increased contrast)
    setContrastLevel(parseInt(e.target.value));
    if (context) {
      applyContrast();
    }
  };
  useEffect(() => {
    if (context && originalImageData && contrastLevel !== undefined) {
      applyFilters();
    }
  }, [brightnessLevel, contrastLevel, sharpeningLevel, opacityLevel]);
  
  
  

  const handleBrightnessChange = (e) => {
    setBrightnessLevel(parseInt(e.target.value)); // Parse to integer
    if (context && originalImageData) {
      applyBrightness(originalImageData); // Pass the originalImageData to applyBrightness
    }
  };
  

  const applyBrightness = (imageData) => {
    const data = imageData.data;

    const brightnessFactor = brightnessLevel / 100;

    for (let i = 0; i < data.length; i += 4) {
      data[i] += 255 * brightnessFactor;
      data[i + 1] += 255 * brightnessFactor;
      data[i + 2] += 255 * brightnessFactor;
    }
  };


  const handleMouseDown = (e) => {
    setDrawing(true);
    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    if (selectedTool === 'pencil') {
      drawLine(lastX, lastY, x, y);
    } else if (selectedTool === 'eraser') {
      eraseLine(x, y);
    }
    setLastX(x);
    setLastY(y);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const drawLine = (x1, y1, x2, y2) => {
    if (!context) return;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  };

  const eraseLine = (x, y) => {
    if (!context) return;
    context.clearRect(x - 2, y - 2, 4, 4);
  };

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(img);
      };
      img.src = reader.result;
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  

  const handlePrint = () => {
    if (context) {
      window.print();
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const imageURL = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      a.download = 'edited_image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className='h-screen w-screen flex bg-[#fff]'>
      <div className='w-[75%] px-2'>
        <div className='bg-grey-900 text-5xl border border-2 h-full flex items-center justify-center'>
          <canvas
            ref={canvasRef}
            className='max-w-full max-h-full'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas>
        </div>
      </div>
      <div className='w-[25%]'>
        <div className='border border-2 h-screen'>
          <h1>Brightness</h1>
          <input
            type='range'
            min='0'
            max='200'
            value={brightnessLevel}
            onChange={handleBrightnessChange}
          />
          <div>
  <h1>Opacity</h1>
  <input
    type='range'
    min='0'
    max='100'
    value={opacityLevel}
    onChange={handleOpacityChange}
  />
  <div>
  <h1>Contrast</h1>
  <input
        type='range'
        min='-100' // Minimum contrast for negative image
        max='200' // Maximum contrast for increased contrast
        value={contrastLevel}
       
        onChange={handleContrastChange}
      />
       <h1>Range</h1>
      <input
        type='range'
        min='-100' // Allow adjusting from negative (reduce sharpening) to positive (increase sharpening)
        max='200'
        value={sharpeningLevel}
                defaultValue={100}

        onChange={handleSharpeningChange}
      />
  <h1>Zoom</h1>
        <input
          type='range'
          min='0.1' // Minimum zoom (10% of original size)
          max='5' // Maximum zoom (5x original size)
          step='0.1' // Optional step value for finer control
          value={zoomLevel} // Display zoom level as a percentage
          onChange={handleZoomChange}
        />
</div>

</div>

          <div>
            <h1>Tools</h1>
            <button onClick={() => handleToolChange('pencil')}>Pencil</button>
            <button onClick={() => handleToolChange('eraser')}>Eraser</button>
          </div>
          <div>
            <h1>Upload Image</h1>
            <input type='file' onChange={handleImageUpload} />
          </div>
          <div>
            <button onClick={handlePrint}>Print</button>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
