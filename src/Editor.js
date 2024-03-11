import React, { useState, useRef } from "react";

const filterOptions = [
  { id: "brightness", name: "Brightness" },
  { id: "saturation", name: "Saturation" },
  { id: "contrast", name: "Contrast" },
  { id: "sharpness", name: "Sharpness" },
  { id: "inversion", name: "Inversion" },
  { id: "grayscale", name: "Grayscale" },
  { id: "lineThickness", name: "Line Thickness" },
  { id: "zoom", name: "Zoom" },
  { id: "opacity", name: "Opacity" },
];

function Editor() {
  const [previewImg, setPreviewImg] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    saturation: 100,
    contrast: 100,
    sharpness: 0,
    inversion: 0,
    grayscale: 0,
    lineThickness: 1,
    zoom: 1,
    opacity: 1,
  });

  const fileInputRef = useRef(null);
  const previewImgRef = useRef(null);

  const applyFilter = () => {
    if (previewImgRef.current) {
      let filterStyle = "";
      for (let key in filters) {
        if (key === "zoom" || key === "opacity") {
          filterStyle += `${key}(${filters[key]}) `;
        } else {
          filterStyle += `${key}(${filters[key]}%) `;
        }
      }
      previewImgRef.current.style.filter = filterStyle;
    }
  };

  const resetFilter = () => {
    setPreviewImg(null);
    setFilters({
      brightness: 100,
      saturation: 100,
      contrast: 100,
      sharpness: 0,
      inversion: 0,
      grayscale: 0,
      lineThickness: 1,
      zoom: 1,
      opacity: 1,
    });
  };

  const saveImage = () => {
    if (previewImg) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.filter = `brightness(${filters.brightness}%) saturate(${filters.saturation}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%)`;
        ctx.filter += `blur(${filters.sharpness}px)`;
        ctx.drawImage(image, 0, 0);

        const link = document.createElement("a");
        link.download = "image.jpg";
        link.href = canvas.toDataURL();
        link.click();
      };

      image.src = URL.createObjectURL(previewImg);
    }
  };

  const handleSliderChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    applyFilter();
  };

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const image = new Image();
      image.onload = () => {
        setPreviewImg(image);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-lg">
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4">
              <div className="space-y-4">
                {filterOptions.map((option) => (
                  <div key={option.id}>
                    <label htmlFor={option.id} className="block text-sm font-medium text-gray-700">
                      {option.name}
                    </label>
                    <input
                      type="range"
                      id={option.id}
                      min="0"
                      max={option.id === "brightness" || option.id === "saturation" ? "200" : "100"}
                      value={filters[option.id]}
                      onChange={(e) => handleSliderChange(option.id, e.target.value)}
                      className="block w-full bg-gray-200 rounded-lg appearance-none focus:outline-none focus:bg-gray-300 focus:ring focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">
                      {`${filters[option.id]}${option.id === "zoom" || option.id === "opacity" ? "%" : ""}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-center items-center h-full">
                {previewImg ? (
                  <img
                    src={URL.createObjectURL(previewImg)}
                    alt="preview"
                    ref={previewImgRef}
                    onLoad={applyFilter}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <img src="image-placeholder.svg" alt="preview-img" className="max-w-full h-auto rounded-lg" />
                )}
              </div>
            </div>
          </div>
          <div className="p-4 flex justify-end">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
              onChange={loadImage}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mr-4"
              onClick={() => fileInputRef.current.click()}
            >
              Choose Image
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mr-4"
              onClick={resetFilter}
            >
              Reset Filters
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
              onClick={saveImage}
            >
              Save Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
