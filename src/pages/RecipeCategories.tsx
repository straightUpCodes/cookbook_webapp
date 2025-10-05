import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AddCategory from "../components/AddCategory.tsx";
const apiUrl = import.meta.env.VITE_API_URL;

const RecipeCategories = () => {
  const [categories, setCategories] = useState<any[]>([]); // Store categories
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories(); // Call fetchCategories function to get categories
  }, []); // Empty dependency array to run this only once when component mounts

  const fetchCategories = () => {
    fetch(`${apiUrl}/api/categories`, {
      headers: {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json(); // Parse JSON
      })
      .then((data) => {
        setCategories(data); // Set categories state
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((err) => {
        setError(err.message); // Set error if any occurs
        setLoading(false); // Set loading to false if an error occurs
      });
  };

  const deleteCategory = async (key: string) => {
    try {
      await fetch(`${apiUrl}/api/category/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: key,
        }),
      });
      fetchCategories(); // Fetch the updated category list after successful addition
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  if (loading) return <p>Loading...</p>; // Display loading text
  if (error) return <p>Error: {error}</p>; // Display error if any

  return (
    <>
      <AddCategory fetchCategories={fetchCategories} />
      <br></br>
      <div className="container">
        {categories.map((category, index) => (
          <ul key={index} className="list-group">
            {Object.keys(category)
              .filter((key) => key !== "_id") // Exclude the '_id' field
              .map((key) => (
                <li key={key} className="list-group-item">
                  <div className="row">
                    <div className="col">
                      <button className="list-group-item list-group-item-action">
                        <Link to={`/categories/${key}`}>
                          {key} {category[key]}{" "}
                        </Link>
                      </button>
                    </div>
                    <div className="col-auto">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => deleteCategory(key)}
                      >
                        <img src="../../delete-icon.svg" alt="Delete" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        ))}
      </div>
    </>
  );
};

export default RecipeCategories;
