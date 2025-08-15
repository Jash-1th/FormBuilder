export const onCatDragEnd = (result, catUnassigned, setCatUnassigned, catAssignments, setCatAssignments, setAnswered, form) => {
  if (!result.destination) return;
  const { source, destination, draggableId } = result;

  const findItemById = (items, id) => items.find(item => item.id === id);

  if (source.droppableId === "unassigned") {
    const item = findItemById(catUnassigned, draggableId);
    if (!item) return;
    
    setCatUnassigned(catUnassigned.filter(it => it.id !== draggableId));
    setCatAssignments(prev => ({
      ...prev,
      [destination.droppableId]: [...(prev[destination.droppableId] || []), item]
    }));
  } else if (destination.droppableId === "unassigned") {
    const item = findItemById(catAssignments[source.droppableId], draggableId);
    if (!item) return;
    
    setCatAssignments(prev => ({
      ...prev,
      [source.droppableId]: prev[source.droppableId].filter(it => it.id !== draggableId)
    }));
    setCatUnassigned(prev => [...prev, item]);
  } else if (source.droppableId !== destination.droppableId) {
    const item = findItemById(catAssignments[source.droppableId], draggableId);
    if (!item) return;
    
    setCatAssignments(prev => ({
      ...prev,
      [source.droppableId]: prev[source.droppableId].filter(it => it.id !== draggableId),
      [destination.droppableId]: [...(prev[destination.droppableId] || []), item]
    }));
  }

  const totalAssigned = Object.values(catAssignments).flat().length;
  const catQ = form?.questions?.[0];
  const allItemsAssigned = (totalAssigned + catUnassigned.length) === (catQ?.items?.length || 0) && totalAssigned > 0;
  setAnswered(prev => [allItemsAssigned, prev[1], prev[2]]);
};