import React, { useState } from 'react';

export default function Register() {
  const [imagePreview, setImagePreview] = useState(null);

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Function to handle printing
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<img src="${imagePreview}" style="max-width:100%; max-height:100vh;"/>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Function to handle saving or downloading
  const handleSave = () => {
    const a = document.createElement('a');
    a.href = imagePreview;
    a.download = 'image.jpg'; // You can set desired filename here
    a.click();
  };

  return (
    <div className='h-screen w-screen flex bg-[#fff121]'>
      <div className='w-[75%] px-2'>
        <div className=' bg-grey-900 text-5xl border border-2 h-full flex items-center justify-center'>
          {imagePreview ? (
            <img src={imagePreview} alt='Preview' className='max-w-full max-h-full' />
          ) : (
            <h2 className='text-white'>Upload an image</h2>
          )}
        </div>
      </div>
      <div className='w-[25%]'>
        <div className=' border border-2 h-screen '>
          <h1>Thickness</h1>
          <input type='range' />
          <h1>Range</h1>
          <input type='range' />
          <h1>Opacity</h1>
          <input type='range' />
          <h1>Contrast</h1>
          <input type='range' />
          <div>
            <h1>Upload Image</h1>
            <input type='file' onChange={handleImageUpload} />
          </div>
          <div className='flex'>
            <button className='px-3 border border-1' onClick={handlePrint}>Print</button>
            <button className='px-3 border border-1' onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
