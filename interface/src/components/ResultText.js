import React from 'react';

function ResultText(props) {
  if (props.annotations.length > 0) {
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
  } else {
    return (
      <div></div> // Put lorem ipsum template here
    );
  }
}

export default ResultText;
