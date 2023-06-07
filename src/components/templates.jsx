import React, { useState, useEffect } from "react";

const loadTemplate = async ({ customerId }) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/newLabels/customer/${customerId}/`
    );
    const template = await response.json();
    if (!response.ok) {
      const message = "error";
      throw new Error(message);
    }
    return template;
  } catch (error) {
    console.error("Error loading template:", error);
    return null;
  }
};

const postNewLabelDesign = async function ({ customerId, templateName, imageTemplate, format, canvasElements }) {
 
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/newLabels/customer/${customerId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: templateName,
        thumbnail: imageTemplate,
        design: {
          format,
          elements: canvasElements,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log('Error making the request:', response.status);
      return null;
    }
  } catch (error) {
    console.log('Error making the request:', error);
    return null;
  }
};

export default function Templates({ setSelectedTemplate, handleCaptureClick, format, canvasElements }) {
  const customerId = 1;
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState("");
  
  const fetchTemplate = async () => {
    try {
      const templateURL = await loadTemplate({ customerId });
      setTemplates(templateURL);
    } catch (error) {
      console.error('Error al cargar el template:', error);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
  };

  const handleSaveTemplate = async () => {
    setError("");
    if (templateName.trim() === "") {
      setError("Please enter a name for the template");
      return;
    }

    try {
      
      const imageTemplate = await handleCaptureClick();
      await postNewLabelDesign({ customerId, templateName, imageTemplate, format, canvasElements });
      await fetchTemplate();

    } catch (error) {
      console.log('Error saving template:', error);
    }
  };

  return (
    <div className="overflow-y-auto h-screen">
      <h1 className="pb-4">Templates</h1>
      <div className="gap-4 pb-4 mb-2 border-b border-stalte-200 mt-4 ">
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter the name of the template"
          className="border border-gray-300 rounded-lg p-2 mb-4"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={() => handleSaveTemplate()}
          className="bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold py-2 px-4"
        >
          save template
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-4">
        {templates && templates.length > 0 ? (
          templates.map((template, index) => (
            <div
              key={index}
              className="pb-4 flex justify-center items-center cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-32 h-auto"
              />
            </div>
          ))
        ) : (
          <p>No hay templates disponibles.</p>
        )}
      </div>
    </div>
  );
}