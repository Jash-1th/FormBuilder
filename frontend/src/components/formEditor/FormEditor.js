import React, { useState } from "react";
import FormPreview from "../FormPreview";
import { createForm } from "../../api";
import { useNavigate } from "react-router-dom";
import { useCategoryFunctions } from "./categoriesHelperFunctions";
import { useClozeFunctions } from "./clozeHelperFunctions";
import { useComprehensionFunctions } from "./comprehensionsHelperFunctions";
import { getFormData } from "./formDataHelper";
export default function FormEditor() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [headerImg, setHeaderImg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCategoryVideo, setShowCategoryVideo] = useState(false);
  const navigate = useNavigate();

  // Import helper functions
  const category = useCategoryFunctions();
  const cloze = useClozeFunctions();
  const comprehension = useComprehensionFunctions();

  const uploadImage = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);
  };
  const showFormPreview = () => {
    if (!title.trim()) {
      alert("Please add a title first!");
      return;
    }
    setShowPreview(true);
  };

 if (showPreview) {
  return (
    <FormPreview
      data={getFormData(title, desc, headerImg, category, cloze, comprehension)}
      onBack={() => setShowPreview(false)}
      onSubmit={async () => {
        try {
          await createForm(getFormData(title, desc, headerImg, category, cloze, comprehension));
          navigate("/");
        } catch (err) {
          console.error("Save error:", err);
          alert("Oops! Couldn't save. Try again?");
        }
      }}
    />
  );
}

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4">Create New Form</h2>
      
      {/* Basic Info Section */}
      <div className="mb-4">
        <label className="form-label">Form Title*</label>
        <input
          className="form-control mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Description</label>
        <textarea
          className="form-control mb-2"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />
      </div>

      {/* Header Image */}
      <div className="mb-4">
        <label className="form-label">Header Image (Optional)</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => uploadImage(e, setHeaderImg)}
        />
      </div>

      <hr />

      {/* Categorize Section */}
      <div className="mb-4">
        <h4>1. Categorization Question</h4>
        {!showCategoryVideo && (
          <button 
            className="btn btn-outline-info mb-3"
            onClick={() => setShowCategoryVideo(!showCategoryVideo)}
          >
            Know about Categorization question
          </button>
        )}
        {showCategoryVideo && (
          <>
            <button 
              onClick={() => setShowCategoryVideo(!showCategoryVideo)} 
              className="btn btn-sm btn-danger mb-2"
            >
              Close Video
            </button>
            <div className="ratio ratio-16x9 mb-3">
              <video controls style={{ borderRadius: 10, border: "1px solid #eee" }}>
                <source src="/media/demoCat.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </>
        )}
        
        <div className="mb-3">
          <label className="form-label" htmlFor="categorize">Question Text</label>
          <input
            id="categorize"
            className="form-control"
            value={category.catText}
            onChange={(e) => category.setCatText(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image (Optional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => uploadImage(e, category.setCatImg)}
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Categories</label>
              {category.categories.map((cat, i) => (
                <div key={i} className="input-group mb-2">
                  <input
                    className="form-control"
                    value={cat.name}
                    onChange={(e) => category.updateCategory(i, e.target.value)}
                    placeholder={`Category ${i+1}`}
                  />
                  {category.categories.length > 1 && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => category.removeCategory(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button 
                className="btn btn-outline-primary"
                onClick={category.addNewCategory}
              >
                Add Category
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Items</label>
              {category.items.map((item, i) => (
                <div key={i} className="mb-2">
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={item.text}
                      onChange={(e) => category.handleItemTextChange(i, e.target.value)}
                      placeholder={`Item ${i+1}`}
                    />
                    {category.items.length > 1 && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => category.removeItem(i)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <select
                    className="form-select mt-1"
                    value={item.category}
                    onChange={(e) => category.handleItemCategory(i, e.target.value)}
                  >
                    <option value="">Select category...</option>
                    {category.categories
                      .filter(c => c.name.trim())
                      .map((cat, j) => (
                        <option key={j} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
              <button 
                className="btn btn-outline-primary"
                onClick={category.addNewItem}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Cloze Section */}
      <div className="mb-4">
        <h4>2. Fill-in-the-Blanks</h4>
        
        <div className="mb-3 p-3 bg-light rounded">
          <label className="form-label">Preview:</label>
          <div className="p-2">
            {cloze.renderClozePreview()}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Enter Sentence</label>
          <textarea
            className="form-control"
            value={cloze.sentence}
            onChange={(e) => cloze.setSentence(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Select Words to Blank Out</label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {cloze.sentence.split(" ").filter(w => w.trim()).map((word, i) => (
              <button
                key={i}
                type="button"
                className={`btn btn-sm ${cloze.blanks.includes(i) ? "btn-secondary" : "btn-outline-primary"}`}
                onClick={() => { 
                  if(!cloze.blanks.includes(i))
                    cloze.setSelected({ word, index: i })}}
              >
                {word}
              </button>
            ))} 
          </div>

          {cloze.selected.word && (
            <div className="alert alert-info p-2 d-flex align-items-center">
              <span className="me-2">Mark "<b>{cloze.selected.word}</b>" as blank?</span>
              <button 
                className="btn btn-sm btn-success me-1"
                onClick={cloze.markBlank}
              >
                Yes
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => cloze.setSelected({ word: "", index: null })}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Blank Answers</label>
          {cloze.answers.length > 0 ? (
            <div>
              {Object.entries(cloze.getGroupedAnswers()).map(([word, wordAnswers]) => (
                <div key={word} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{word}</strong>
                    <span className="badge bg-primary">
                      {wordAnswers.length} blank{wordAnswers.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ms-3">
                    {wordAnswers.map(answer => (
                      <div key={answer.id} className="d-flex justify-content-between align-items-center mb-1">
                        <span>Position {answer.position + 1}</span>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cloze.removeBlank(answer.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No blanks added yet</p>
          )}
        </div>
      </div>

      <hr />

      {/* Comprehension Section */}
      <div className="mb-4">
        <h4>3. Reading Comprehension</h4>
        
        <div className="mb-3">
          <label className="form-label">Reading Passage</label>
          <textarea
            className="form-control"
            value={comprehension.passage}
            onChange={(e) => comprehension.setPassage(e.target.value)}
            rows={5}
          />
        </div>

        <label className="form-label">Questions</label>
        {comprehension.questions.map((q, i) => (
          <div key={i} className="mb-3 p-3 border rounded">
            <div className="d-flex justify-content-between mb-2">
              <h5>Question 3.{i+1}</h5>
              {comprehension.questions.length > 1 && (
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => comprehension.removeQuestion(i)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Question Text</label>
              <input
                className="form-control"
                value={q.question}
                onChange={(e) => comprehension.changeQuestion(i, "question", e.target.value)}
              />
            </div>

            <label className="form-label">Options</label>
            {q.choices.map((opt, j) => (
              <div key={j} className="input-group mb-2">
                <div className="input-group-text">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={q.answer === j}
                    onChange={() => comprehension.changeQuestion(i, "answer", j)}
                  />
                </div>
                <input
                  className="form-control"
                  value={opt}
                  onChange={(e) => comprehension.changeQuestion(i, "choices", 
                    q.choices.map((o, k) => k === j ? e.target.value : o)
                  )}
                />
                {q.choices.length > 2 && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => comprehension.removeOption(i, j)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              className="btn btn-outline-secondary"
              onClick={() => comprehension.addOption(i)}
            >
              Add Option
            </button>
          </div>
        ))}

        <button
          className="btn btn-outline-primary"
          onClick={comprehension.addNewQuestion}
        >
          Add Question
        </button>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button 
          className="btn btn-primary px-4 py-2"
          onClick={showFormPreview}
        >
          Preview Form
        </button>
      </div>
    </div>
  );
}