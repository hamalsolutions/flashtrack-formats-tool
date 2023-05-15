import React, { useState, useEffect } from 'react';

const FONT_FAMILY_LIST = [
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Calibri', value: 'Calibri' },
  { name: 'Cambria', value: 'Cambria' },
  { name: 'Helvetica', value: 'Helvetica' },
];

export default function TextEditor ({fontFamily, setFontFamily}){

  const [view, setView] = useState('fontList'); // 'fontList' o 'uploadFont'
  const [newFontName, setNewFontName] = useState('');
  const [newFontFile, setNewFontFile] = useState(null);
  const [customFonts, setCustomFonts] = useState([]); // Lista de fuentes personalizadas
  const [error, setError] = useState(false);

  useEffect(() => {
    // Carga las fuentes personalizadas guardadas en el localStorage al iniciar la aplicación
    const storedFonts = localStorage.getItem('customFonts');
    if (storedFonts) {
      setCustomFonts(JSON.parse(storedFonts));
    }
  }, []);

  useEffect(() => {
    // Guarda las fuentes personalizadas en el localStorage al actualizar la lista
    localStorage.setItem('customFonts', JSON.stringify(customFonts));
  }, [customFonts]);

  useEffect(() => {
    // Agrega una etiqueta de estilo al encabezado de la página para cargar las fuentes personalizadas
    const customFontsStylesheet = document.createElement('style');
    const fontFaceRules = customFonts.map(font => {
      return `
        @font-face {
          font-family: "${font.name}";
          src: url(${font.file});
        }
      `;
    });
    customFontsStylesheet.textContent = fontFaceRules.join('\n');
    document.head.appendChild(customFontsStylesheet);
  }, [customFonts]);


  const handleFontFamilyChange = (event) => {
    setFontFamily(event.target.value);
  };

  const handleNewFontNameChange = (event) => {
    setNewFontName(event.target.value);
  };

  const handleNewFontFileChange = (event) => {
    setNewFontFile(event.target.files[0]);
    };
    
  function handleView(view) {
    setView(view);
    setError(false);    
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!newFontName.trim()) {
      setError(true);
      return;
    }
      
    // Agrega la nueva fuente a la lista de fuentes personalizadas
    const newFont = {
      name: newFontName,
      file: URL.createObjectURL(newFontFile),
      value: newFontName,
    };
    setCustomFonts([...customFonts, newFont]);
    // Reinicia los campos del formulario
    setNewFontName('');
    setNewFontFile(null);
    // Cambia la vista de nuevo a la lista de fuentes
    setView('fontList');
    setError(false);
  };

  const allFonts = [...FONT_FAMILY_LIST, ...customFonts];

  return (
    <div>
      {view === 'fontList' ? (
        <div>
          <div>
            <label htmlFor="font-family-select" className="text-ft-blue-300" >Font: </label>
            <select id="font-family-select" className="py-2 max-w-lg block w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md" value={fontFamily} onChange={handleFontFamilyChange}>
            {allFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
            <div className="flex justify-center w-full mt-8">
              <button className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" onClick={() => handleView('uploadFont')}>Upload new font</button>
            </div> 
          </div>
      ) : (
        <div>
          <h2 className="text-ft-blue-300">Upload new font</h2>
          <div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="new-font-name"  className="text-ft-blue-300" >Font name: </label>
              <input id="new-font-name" type="text" className="max-w-lg block w-full shadow-sm py-2 px-2 sm:max-w-xs sm:text-sm border-gray-300 rounded-md" value={newFontName} onChange={handleNewFontNameChange} />
              {error && (
                <p className="text-red-600 text-sm mt-1">This field is required</p>
              )}
              <br />
              <label htmlFor="new-font-file" className="text-ft-blue-300" >Font file: </label>
                <label className="block text-gray-700 text-sm font-bold mb-4 mt-2 pb-4">
                Upload Font:
                <input type="file" className="hidden" accept=".ttf, .otf" onChange={handleNewFontFileChange} />
                <span className="ml-2 inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg cursor-pointer">
                    Choose file
                </span>
            </label>
                <br />
                <div className="flex justify-start w-full">
                <button  className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4" type="submit">Add Font</button>
                <button  className="bg-white px-4 mx-2 border border-[#3c5865] rounded-md shadow-sm text-sm font-bold text-[#3c5865] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c5865]" onClick={() => handleView('fontList')} >Cancel</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}