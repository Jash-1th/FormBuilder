import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import SideNavigation from './SideNavigation';
import { onCatDragEnd } from './categorizeDnd';
import { onClozeDragEnd } from './clozeDnd';
import TestCompleted from "./TestCompleted";

// Helper function to sanitize keys for MongoDB
const sanitizeKey = (key) => {
  return key.replace(/\./g, '_dot_');
};

export default function FillForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Categorize state
  const [catAssignments, setCatAssignments] = useState({});
  const [catUnassigned, setCatUnassigned] = useState([]);
  
  // Cloze state
  const [clozeBlanks, setClozeBlanks] = useState([]);
  const [clozeUnfilled, setClozeUnfilled] = useState([]);
  const [blankPositions, setBlankPositions] = useState([]);
  
  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState([]);
  
  // Progress state
  const [answered, setAnswered] = useState([false, false, false]);
  const [filter, setFilter] = useState("all");
  
  // Submission state
  const [submitted, setSubmitted] = useState(false);

  // Fetch form data
  useEffect(() => {
    async function fetchForm() {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/forms/${formId}`);
        setForm(data);

        // Initialize Categorize state with unique IDs
        const catQ = data?.questions?.[0];
        setCatUnassigned(catQ?.items?.map((item, idx) => ({ 
          ...item, 
          id: `${item.value}-${idx}` 
        })) || []);
        
        setCatAssignments(
          Object.fromEntries((catQ?.categories || []).map(cat => [sanitizeKey(cat), []]))
        );

        // Initialize Cloze state
        const clozeQ = data?.questions?.[1];
        if (clozeQ) {
          setBlankPositions(clozeQ.blankPositions || []);
          setClozeBlanks(clozeQ.clozeAnswers?.map(() => null) || []);
          setClozeUnfilled(clozeQ.clozeAnswers?.map((word, idx) => ({
            word,
            id: `${word}-${idx}`
          })) || []);
        }

        // Initialize MCQ state
        const compQ = data?.questions?.[2];
        setMcqAnswers(compQ?.mcqs?.map(() => null) || []);

        setAnswered([false, false, false]);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [formId]);

  // Handle MCQ selection
  const handleMcqSelect = (qIndex, optionIndex) => {
    setMcqAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[qIndex] = optionIndex;
      return newAnswers;
    });
    
    setAnswered(prev => {
      const newAnswered = [...prev];
      newAnswered[2] = mcqAnswers.every((ans, i) => 
        i === qIndex ? optionIndex !== null : ans !== null
      );
      return newAnswered;
    });
  };

  // Filter questions
  const filteredQuestions = () => {
    if (filter === "answered") return answered.map((a, i) => a ? i : null).filter(i => i !== null);
    if (filter === "unanswered") return answered.map((a, i) => !a ? i : null).filter(i => i !== null);
    return [0, 1, 2];
  };

  // Handle form submission with proper error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!answered.every(Boolean)) {
      setSubmitError("Please complete all questions before submitting");
      return;
    }

    try {
      // Prepare data with sanitized keys
      const submissionData = {
        formId,
        answers: {
          categorize: Object.fromEntries(
            Object.entries(catAssignments).map(([cat, items]) => [
              sanitizeKey(cat), 
              items.map(item => item.value)
            ])
          ),
          cloze: clozeBlanks.map(b => b?.word || ""),
          comprehension: mcqAnswers
        }
      };

      const response = await axios.post('/api/responses', submissionData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(response.data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      let errorMessage = "Submission failed";
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message;
      }
      
      setSubmitError(errorMessage);
    }
  };

  if (submitted) return <TestCompleted />;
  if (loading) return <div className="text-center py-5">Loading form...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!form?.questions || form.questions.length < 3) {
    return <div className="alert alert-warning">Invalid form data</div>;
  }

  const [catQ, clozeQ, compQ] = form.questions;

  return (
    <div className="container-fluid bg-light" style={{ minHeight: "100vh" }}>
      <form onSubmit={handleSubmit}>
        <div className="row py-4">
          <div className="col-lg-8">
            <h2 className="mb-4">{form.title || "Untitled Quiz"}</h2>
            <hr className="border-warning" />

            {/* Categorize Question */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Question 1: Categorize</h5>
                <DragDropContext 
                  onDragEnd={(result) => onCatDragEnd(
                    result, 
                    catUnassigned, 
                    setCatUnassigned, 
                    catAssignments, 
                    setCatAssignments, 
                    setAnswered, 
                    form
                  )}
                >
                  <div className="mb-3">
                    <small className="text-muted">Drag items to categories</small>
                    <Droppable droppableId="unassigned" direction="horizontal">
                      {(provided) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                          className="d-flex flex-wrap gap-2 p-2 bg-light rounded"
                        >
                          {catUnassigned.map((item, idx) => (
                            <Draggable key={item.id} draggableId={item.id} index={idx}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="px-3 py-2 bg-white border rounded"
                                >
                                  {item.value}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-4">
                    {catQ.categories.map((category, i) => (
                      <Droppable 
                        key={category} 
                        droppableId={sanitizeKey(category)}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex-grow-1 p-3 rounded"
                            style={{
                              minHeight: "120px",
                              backgroundColor: i % 2 ? "#fff9c4" : "#ffd6d6"
                            }}
                          >
                            <h6 className="text-center mb-2">{category}</h6>
                            {(catAssignments[sanitizeKey(category)] || []).map((item, idx) => (
                              <Draggable key={item.id} draggableId={item.id} index={idx}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="px-3 py-2 bg-white border rounded mb-2"
                                  >
                                    {item.value}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            </div>

            {/* Cloze Question */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Question 2: Fill in the Blanks</h5>
                <DragDropContext 
                  onDragEnd={(result) => onClozeDragEnd(
                    result,
                    clozeBlanks,
                    setClozeBlanks,
                    clozeUnfilled,
                    setClozeUnfilled,
                    setAnswered
                  )}
                >
                  <div className="mb-3">
                    <small className="text-muted">Drag words to fill the blanks</small>
                    <Droppable droppableId="cloze-unfilled" direction="horizontal">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="d-flex flex-wrap gap-2 p-2 bg-light rounded"
                        >
                          {clozeUnfilled.map((wordObj, idx) => (
                            <Draggable 
                              key={wordObj.id} 
                              draggableId={wordObj.id} 
                              index={idx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="px-3 py-2 bg-primary text-white rounded"
                                >
                                  {wordObj.word}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  <div className="mt-4">
                    {clozeQ.clozeSentence.split(" ").map((word, i) => {
                      const isBlank = blankPositions.includes(i);
                      const blankIdx = blankPositions.indexOf(i);
                      
                      if (isBlank) {
                        return (
                          <Droppable droppableId={`cloze-blank-${blankIdx}`} key={i}>
                            {(provided) => (
                              <span
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="d-inline-block mx-1 p-1 border-bottom"
                                style={{ minWidth: "80px" }}
                              >
                                {clozeBlanks[blankIdx] ? (
                                  <Draggable 
                                    draggableId={clozeBlanks[blankIdx].id} 
                                    index={0}
                                  >
                                    {(provided) => (
                                      <span
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="px-2 py-1 bg-light rounded"
                                      >
                                        {clozeBlanks[blankIdx].word}
                                      </span>
                                    )}
                                  </Draggable>
                                ) : (
                                  <span className="text-muted">______</span>
                                )}
                                {provided.placeholder}
                              </span>
                            )}
                          </Droppable>
                        );
                      }
                      return <span key={i} className="mx-1">{word}</span>;
                    })}
                  </div>
                </DragDropContext>
              </div>
            </div>

            {/* Comprehension Questions */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Question 3: Comprehension</h5>
                <div className="mb-3 p-3 bg-light rounded">
                  {compQ.passage}
                </div>
                {compQ.mcqs.map((mcq, i) => (
                  <div key={i} className="mb-3 p-3 bg-light rounded">
                    <p><strong>{mcq.question}</strong></p>
                    {mcq.options.map((option, j) => (
                      <div key={j} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`mcq-${i}`}
                          id={`mcq-${i}-${j}`}
                          checked={mcqAnswers[i] === j}
                          onChange={() => handleMcqSelect(i, j)}
                        />
                        <label className="form-check-label" htmlFor={`mcq-${i}-${j}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button with Error Display */}
            <div className="text-center my-4">
              {submitError && (
                <div className="alert alert-danger mb-3">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-lg px-5"
                disabled={!answered.every(Boolean)}
              >
                Submit Answers
              </button>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="col-lg-4">
            <SideNavigation 
              answered={answered}
              filter={filter}
              setFilter={setFilter}
              scrollToQuestion={(qIndex) => {
                document.querySelectorAll('.card')[qIndex]?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}