import { React, useState, useEffect } from "react";


const loadTemplate = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/newLabels/customer/1/`);
    const template = await response.json();
    if (!response.ok) {
      const message = 'error';
      throw new Error(message);
    }
    return template;
  } catch (error) {
    console.error('Error al cargar el template:', error);
    return null;
  }
};


export default function Templates({ setSelectedTemplate }) {
  
  const [templates, setTemplates] = useState([]);

  const fetchTemplate = async () => {
    const templateURL = await loadTemplate();
    setTemplates(templateURL);
  };
  
  useEffect(() => {
    fetchTemplate();
  }, []);

    const handleTemplateClick = (template) => {
      setSelectedTemplate(template);
    };
  
    /*const handleApplyTemplate = () => {
      if (selectedTemplate) {
        applyTemplate(selectedTemplate);
      }
    };*/
  
    return (
    <div className="overflow-y-auto h-screen">
      <h1 className="pb-4">Show Templates</h1>
      <div>
        {templates && templates.length > 0 ? (
          templates.map((template, index) => (
            <div key={index} className="pb-4" onClick={() => handleTemplateClick(template)}>
              <img src={template.thumbnail} alt={template.name} className="w-44 h-auto" />
            </div>
          ))
        ) : (
          <p>No templates available.</p>
        )}
      </div>
    </div>
    );
  }