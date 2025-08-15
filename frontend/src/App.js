import React from 'react';
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import FormEditor from './components/formEditor/FormEditor';
import FormList from './components/FormList';
import FormPreview from './components/FormPreview';
import FormFill from './components/formFill/FormFill';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<FormEditor/>} />
        <Route path="/preview/:id" element={<FormPreview/>} />
        <Route path="/fill/:formId" element={<FormFill/>} />
        <Route path="/" element={<FormList/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;