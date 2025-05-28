import React from 'react';

const PreviewPane = ({ data }) => {
  return (
    <div className="card mt-4">
      <div className="card-body">
        <h3>{data.name}</h3>
        <p><strong>Education:</strong> {data.education}</p>
        <p><strong>Experience:</strong> {data.experience}</p>
        <p><strong>Skills:</strong> {data.skills}</p>
        <p><strong>Summary:</strong> {data.summary}</p>
      </div>
    </div>
  );
};

export default PreviewPane;