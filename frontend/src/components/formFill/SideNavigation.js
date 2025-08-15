import React from 'react';

const SideNavigation = ({ answered, filter, setFilter, scrollToQuestion }) => {
  const filteredQuestions = () => {
    if (filter === "answered") return answered.map((a, i) => a ? i : null).filter(i => i !== null);
    if (filter === "unanswered") return answered.map((a, i) => !a ? i : null).filter(i => i !== null);
    return [0, 1, 2];
  };

  return (
    <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
      <div className="card-body">
        <h5 className="card-title">Question Navigation</h5>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-success">
              <strong>Answered: {answered.filter(a => a).length}</strong>
            </span>
            <span className="text-primary">
              <strong>Unanswered: {answered.filter(a => !a).length}</strong>
            </span>
          </div>
          <div className="btn-group w-100 mb-3">
            <button
              type="button"
              className={`btn btn-sm ${filter === "all" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === "answered" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setFilter("answered")}
            >
              Answered
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === "unanswered" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setFilter("unanswered")}
            >
              Unanswered
            </button>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {filteredQuestions().map((qIndex) => (
            <button
              key={qIndex}
              type="button"
              className={`btn btn-sm ${answered[qIndex] ? "btn-success" : "btn-outline-primary"}`}
              style={{ width: "40px" }}
              onClick={() => scrollToQuestion(qIndex)}
            >
              {qIndex + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideNavigation;