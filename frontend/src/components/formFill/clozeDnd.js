export const onClozeDragEnd = (result, clozeBlanks, setClozeBlanks, clozeUnfilled, setClozeUnfilled, setAnswered) => {
  if (!result.destination) return;
  const { source, destination, draggableId } = result;

  let newBlanks = [...clozeBlanks];
  let newUnfilled = [...clozeUnfilled];

  const draggedWord = newUnfilled.find(w => w.id === draggableId);
  if (!draggedWord) return;

  if (source.droppableId === "cloze-unfilled" && destination.droppableId.startsWith("cloze-blank-")) {
    const blankIdx = parseInt(destination.droppableId.replace("cloze-blank-", ""));
    
    if (newBlanks[blankIdx]) {
      newUnfilled.push({ word: newBlanks[blankIdx].word, id: newBlanks[blankIdx].id });
    }
    
    newBlanks[blankIdx] = draggedWord;
    newUnfilled = newUnfilled.filter(w => w.id !== draggableId);
  } else if (source.droppableId.startsWith("cloze-blank-") && destination.droppableId === "cloze-unfilled") {
    const blankIdx = parseInt(source.droppableId.replace("cloze-blank-", ""));
    if (newBlanks[blankIdx]) {
      newUnfilled.push(newBlanks[blankIdx]);
      newBlanks[blankIdx] = null;
    }
  }

  setClozeBlanks(newBlanks);
  setClozeUnfilled(newUnfilled);
  setAnswered(prev => [prev[0], newBlanks.every(Boolean), prev[2]]);
};  