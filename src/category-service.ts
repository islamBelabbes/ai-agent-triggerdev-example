import db from "./db";

export const getCategories = async () => {
  return db.categories;
};
