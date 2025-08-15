import { useState } from "react";

export const useClozeFunctions = () => {
  const [sentence, setSentence] = useState("");
  const [blanks, setBlanks] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState({ word: "", index: null });

  const markBlank = () => {
    if (selected.word && selected.index !== null) {
      if (!blanks.includes(selected.index)) {
        setBlanks([...blanks, selected.index].sort((a, b) => a - b));
      }
      setAnswers([...answers, { 
        word: selected.word, 
        position: selected.index,
        id: `${selected.word}-${selected.index}-${Date.now()}`
      }]);
    }
    setSelected({ word: "", index: null });
  };

  const removeBlank = (id) => {
    const answerToRemove = answers.find(a => a.id === id);
    if (!answerToRemove) return;
    
    setBlanks(blanks.filter(pos => pos !== answerToRemove.position));
    setAnswers(answers.filter(a => a.id !== id));
  };

  const getGroupedAnswers = () => {
    const grouped = {};
    answers.forEach(answer => {
      if (!grouped[answer.word]) {
        grouped[answer.word] = [];
      }
      grouped[answer.word].push(answer);
    });
    return grouped;
  };

  const renderClozePreview = () => {
    if (!sentence) return <span className="text-muted">No sentence yet...</span>;
    
    return sentence.split(" ").map((word, i) => {
      if (blanks.includes(i)) {
        const answer = answers.find(a => a.position === i);
        return (
          <b key={i}>
            [<span className="text-primary">{answer?.word || '____'}</span>]
          </b>
        );
      }
      return <span key={i}> {word} </span>;
    });
  };

  return {
    sentence,
    setSentence,
    blanks,
    answers,
    selected,
    setSelected,
    markBlank,
    removeBlank,
    getGroupedAnswers,
    renderClozePreview
  };
};