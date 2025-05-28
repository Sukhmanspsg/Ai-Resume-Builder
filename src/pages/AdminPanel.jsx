import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState('');

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleAddTemplate = async () => {
    if (!name || !htmlCode) return alert('Name and HTML code are required!');
    try {
      await axios.post('/api/templates', {
        name,
        description,
        html_code: htmlCode
      });
      setName('');
      setDescription('');
      setHtmlCode('');
      fetchTemplates();
    } catch (err) {
      console.error('Failed to add template:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-700 mb-4">Manage Templates and Resume Settings</p>

      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Add New Template</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Template Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="HTML Code"
          value={htmlCode}
          rows={6}
          onChange={(e) => setHtmlCode(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAddTemplate}
        >
          Add Template
        </button>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Existing Templates</h2>
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="border p-3 mb-2 rounded flex justify-between items-center"
          >
            <div>
              <strong>{tpl.name}</strong> – {tpl.description}
            </div>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => handleDelete(tpl.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
