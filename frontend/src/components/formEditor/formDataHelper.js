export const getFormData = (title, desc, headerImg, category, cloze, comprehension) => {
  return {
    title,
    description: desc,
    headerImage: headerImg,
    questions: [
      {
        type: "categorize",
        text: category.catText,
        image: category.catImg,
        categories: category.categories.map(c => c.name).filter(Boolean),
        items: category.items.filter(i => i.text.trim()).map(i => ({
          value: i.text,
          belongsTo: i.category
        }))
      },
      {
        type: "cloze",
        clozeSentence: cloze.sentence,
        clozeAnswers: cloze.answers.map(a => a.word),
        blankPositions: cloze.blanks
      },
      {
        type: "comprehension",
        passage: comprehension.passage,
        mcqs: comprehension.questions
          .filter(q => q.question.trim() && q.choices.filter(c => c.trim()).length >= 2)
          .map(q => ({
            question: q.question,
            options: q.choices,
            answer: q.answer
          }))
      }
    ]
  };
};