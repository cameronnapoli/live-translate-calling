import React from 'react';

function LanguageLabel(props) {
  return (
    <div id="target-language-label">
      <label id="target-language-label" htmlFor="target-language">
        Target Language:&nbsp;
      </label>
    </div>
  );
}

function LanguageSelector(props) {
  return (
    <div id="target-language-box">
      <select id="target-language"
              onChange={(e) => {props.changeLanguage(e.target.value)}}>
        <option value="es">Spanish</option>
        <option value="ar">Arabic</option>
        <option value="zh-CN">Chinese (Simplified)</option>
        <option value="is">Icelandic</option>
        <option value="it">Italian</option>
        <option value="ru">Russian</option>
      </select>
      {props.isRecording && <div id="recording-status">&nbsp;</div>}
    </div>
  );
}

export {
  LanguageLabel,
  LanguageSelector
};