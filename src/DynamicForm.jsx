import React, { useState,useEffect } from 'react';
import "./DynamicForm.css";

const DynamicForm = ({ formData }) => {
  const [formValues, setFormValues] = useState({});
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [inputValid, setInputValid] = useState(false);


  useEffect(() => {
    const initialValues = {};
    formData.forEach((param) => {
      if (param.uiType === 'Group') {
        param.subParameters.forEach((subParam) => {
          if (subParam.validate.defaultValue !== undefined && (showAdvancedFields || subParam.validate.required)) {
            initialValues[subParam.jsonKey] = subParam.validate.defaultValue;
          }
        });
      } else if (param.validate.defaultValue !== undefined && (showAdvancedFields || param.validate.required)) {
        initialValues[param.jsonKey] = param.validate.defaultValue;
      }
    });
    setFormValues(initialValues);
  }, [formData,showAdvancedFields]);

  const handleInputChange = (jsonKey, value) => {
    let isValid;

    if (typeof value === 'boolean') {
      isValid = true;
    } else {
      isValid = value.trim() !== '';
    }
    setInputValid(isValid);
    setFormValues((prevValues) => ({
      ...prevValues,
      [jsonKey]: value !== undefined ? value : prevValues[jsonKey],
    }));
  };


  const toggleAdvancedFields = () => {
    setShowAdvancedFields(!showAdvancedFields);
    const hiddenContainer = document.querySelector(".hidden-container");
    setInputValid(false)

    if (hiddenContainer) {
      hiddenContainer.classList.toggle("element-container");
    } else {
      console.error("Element with class 'hidden-container' not found");
    }  };

  const renderForm = (parameters) => {
    return parameters.map((param) => {
      const showField = showAdvancedFields || param.validate.required;

      return (
        <div key={param.jsonKey} style={{ display: showField ? 'block' : 'none' }}>
            {param.uiType=="Group"?<><label>{param.label}<span style={{color:"red"}}>{param.validate.required?"*":''}</span></label><hr /></>:""}

          {param.uiType === 'Input' && (
            <div className='formElement'>
              <label htmlFor={param.jsonKey}>
                {param.label}<span style={{color:"red"}}>{param.validate.required?"*":''}</span>
                {param.description && <span title={param.description}></span>}
              </label>
              <input
                className='input-box'
                type="text"
                id={param.jsonKey}
                value={formValues[param.jsonKey] || ''}
                onChange={(e) => handleInputChange(param.jsonKey, e.target.value)}
                placeholder={param.placeholder}
                disabled={param.validate.immutable}
              />
            </div>
          )}

          {param.uiType === 'Select' && (
            <div className='formElement'>
              <label htmlFor={param.jsonKey}>
                {param.label}<span style={{color:"red"}}>{param.validate.required?"*":''}</span>
                {param.description && <span title={param.description}> (i)</span>}
              </label>
              <select
                className='input-box'
                id={param.jsonKey}
                value={formValues[param.jsonKey] || param.validate.defaultValue}
                onChange={(e) => handleInputChange(param.jsonKey, e.target.value)}
              >
                {param.validate.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {param.uiType === 'Radio' && (
            <div className='formElement radio-container'>
              {param.validate.options.map((option) => (
                <div  className={formValues[param.jsonKey] === option.value?"selected radio-option":"radio-option"} key={Math.random()}>
                  <label key={option.value} htmlFor={option.value} >
                    <input
                      type="radio"
                      value={option.value}
                      id={option.value}
                      checked={formValues[param.jsonKey] === option.value}
                      onChange={(e) => handleInputChange(param.jsonKey, e.target.value)}
                      style={{display:"none"}}
                    />
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {param.uiType === 'Switch' && (
            <div className='formElement'>
              <div key={param.jsonKey} > 
                <input
                  type='checkbox'
                  id={param.jsonKey}
                  value={param.jsonKey}
                  checked={formValues[param.jsonKey] !== undefined ? formValues[param.jsonKey] : param.validate.defaultValue}
                  onChange={(e) => handleInputChange(param.jsonKey, e.target.checked)}
                  ></input>
                  <label htmlFor={param.jsonKey}>{param.label}</label>
                </div>
            </div>
          )}

          {param.uiType === 'Group' && renderForm(param.subParameters)}


        </div>
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValid) {
      console.log('Form submitted:', formValues);
    } else {
      alert("Please fill the form")
    }
  };

  return (
    <form>
      <h2>Form</h2>
      {formData.sort((a, b) => a.sort - b.sort).map((param) => (
        <div key={param.jsonKey} className={param.validate.required?'element-container':'hidden-container'}>
          {param.uiType === 'Ignore' ? null : renderForm([param])}
        </div>
      ))}
        
      <div className='switch-button'> 
        <label htmlFor="switch">{showAdvancedFields ? 'Hide Advanced Fields' : 'Show Advanced Fields'}</label>
        <span>
          <input type="checkbox"
                id="switch"
                className="checkbox"
                onChange={toggleAdvancedFields} />        
          <label htmlFor="switch"className="toggle"></label>
        </span>
      </div> 
      <button type="button" onClick={handleSubmit} className='btn submit'>Submit</button>
    </form>
  );
};

export default DynamicForm;
