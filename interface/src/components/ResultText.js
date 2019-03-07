import React from 'react';

function ResultText(props) {
  return (
    <div>
      {props.annotations.map((annotation, index) => {
        return (
          <div key={index}>
            <div className="original">{annotation.original}</div>
            <div className="translated">{annotation.translated}</div>
          </div>
        )
      })}
    </div>
  );
}

export default ResultText;
