import React from 'react';
import Select from 'react-select';

function LanguageLabel(props) {
  return (
    <div id="target-language-label-box">
      <label id="target-language-label" htmlFor="target-language">
        Target Language:&nbsp;
      </label>
    </div>
  );
}

const options = [
  { value: 'es', label: "Spanish" },
  { value: 'ar', label: "Arabic" },
  { value: 'zh-CN', label: "Chinese (Simplified)" },
  { value: 'is', label: "Icelandic" },
  { value: 'it', label: "Italian" },
  { value: 'ru', label: "Russian" }
];

function LanguageSelector(props) {
  return (
    <div id="target-language-box">
      <Select 
        value={props.languageSelected}
        onChange={props.changeLanguage}
        options={options}
      />
    </div>
  );
}

export {
  LanguageLabel,
  LanguageSelector
};
