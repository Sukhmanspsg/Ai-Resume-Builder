// src/pages/Templates.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Hardcoded resume ID used for rendering previews with actual content
const resumeId = 17; // Replace with a dynamic value if needed

const Templates = () => {
  // State to store the list of templates with rendered HTML previews
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch template metadata and their rendered previews
    const fetchPreviews = async () => {
      try {
        // Fetch all available templates from the backend
        const templateRes = await axios.get('http://localhost:5000/api/templates');
        const templates = templateRes.data;

        // For each template, fetch its rendered HTML preview
        const previewPromises = templates.map(async (tpl) => {
          try {
            const renderRes = await axios.get(
              `http://localhost:5000/api/templates/render/${tpl.id}?resumeId=${resumeId}`
            );
            return { ...tpl, renderedHTML: renderRes.data }; // Merge rendered HTML with template data
          } catch (err) {
            console.error(`Error rendering template ${tpl.id}:`, err);
            return {
              ...tpl,
              renderedHTML: `<p style="color:red;">Failed to load preview</p>` // Fallback content
            };
          }
        });

        // Wait for all templates to finish rendering
        const allPreviews = await Promise.all(previewPromises);
        setPreviews(allPreviews); // Save to state
        setLoading(false); // Stop loading indicator
      } catch (err) {
        console.error('Error loading templates:', err);
        setLoading(false);
      }
    };

    fetchPreviews(); // Trigger fetching on component mount
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">Available Templates</h1>

      {/* Show loading indicator while templates are being fetched */}
      {loading ? (
        <p>Loading templates...</p>
      ) : (
        // Grid layout for displaying each template preview
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {previews.map((tpl) => (
            <div key={tpl.id} className="border rounded-lg p-4 shadow bg-white">
              <h2 className="font-semibold text-xl mb-2 text-center">{tpl.name}</h2>
              <p className="text-sm text-gray-600 mb-4 text-center">{tpl.description}</p>

              {/* Display rendered HTML using iframe and srcDoc */}
              <iframe
                title={tpl.name}
                srcDoc={tpl.renderedHTML}
                style={{
                  width: '100%',
                  height: '750px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
