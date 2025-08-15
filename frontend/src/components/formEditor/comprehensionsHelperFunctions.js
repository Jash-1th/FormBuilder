import { useState } from "react";

export const useComprehensionFunctions = () => {
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState([
    { 
      question: "", 
      choices: ["", ""],
      answer: 0
    }
  ]);

  const changeQuestion = (qIdx, field, val) => {
    setQuestions(
      questions.map((q, i) => 
        i === qIdx ? { ...q, [field]: val } : q
      )
    );
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", choices: ["", ""], answer: 0 }
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const removeOption = (qIdx, optIdx) => {
    const question = questions[qIdx];
    const newChoices = question.choices.filter((_, i) => i !== optIdx);
    let newAnswer = question.answer;
    
    if (optIdx === question.answer) {
      newAnswer = 0;
    } else if (optIdx < question.answer) {
      newAnswer = question.answer - 1;
    }
    
    changeQuestion(qIdx, "choices", newChoices);
    changeQuestion(qIdx, "answer", newAnswer);
  };

  const addOption = (qIdx) => {
    const question = questions[qIdx];
    changeQuestion(qIdx, "choices", [...question.choices, ""]);
  };

  return {
    passage,
    setPassage,
    questions,
    changeQuestion,
    addNewQuestion,
    removeQuestion,
    removeOption,
    addOption
  };
};