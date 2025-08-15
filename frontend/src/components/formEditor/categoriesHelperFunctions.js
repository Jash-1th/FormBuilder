import { useState } from "react";

export const useCategoryFunctions = () => {
  const [catText, setCatText] = useState("");
  const [catImg, setCatImg] = useState("");
  const [categories, setCategories] = useState([{ name: "" }]);
  const [items, setItems] = useState([{ text: "", category: "" }]);

  const updateCategory = (idx, val) => {
    const updated = [...categories];
    updated[idx] = { ...updated[idx], name: val };
    setCategories(updated);
  };

  const addNewCategory = () => {
    setCategories([...categories, { name: "" }]);
  };

  const removeCategory = (idx) => {
    const newItems = items.map(item => {
      if (item.category === categories[idx].name) {
        return { ...item, category: "" };
      }
      return item;
    });
    setItems(newItems);
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const handleItemTextChange = (idx, val) => {
    const newItems = [...items];
    newItems[idx].text = val;
    setItems(newItems);
  };

  const handleItemCategory = (idx, cat) => {
    const updated = [...items];
    updated[idx].category = cat;
    setItems(updated);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const addNewItem = () => {
    setItems([...items, { text: "", category: "" }]);
  };

  return {
    catText,
    setCatText,
    catImg,
    setCatImg,
    categories,
    items,
    updateCategory,
    addNewCategory,
    removeCategory,
    handleItemTextChange,
    handleItemCategory,
    removeItem,
    addNewItem
  };
};