import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import UpdateRecipe from "../components/UpdateRecipe";
const apiUrl = import.meta.env.VITE_API_URL;

const RecipeDetails = () => {
  const { recipe_name } = useParams();
  const [recipe_details, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState<boolean>(false);

  const triggerRefresh = () => {
    setRefresh((prev) => !prev); // Toggle refresh to trigger useEffect re-fetch
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/recipe/${recipe_name}`, {})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        return response.json();
      })
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [recipe_name, refresh]); // Added category as a dependency

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const deleteRecipe = async () => {
    try {
      await fetch(`${apiUrl}/api/recipe/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: recipe_name }),
      });
      navigate(-1);
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  function CookTimeParse() {
    var hours = recipe_details[0]?.cookTime?.hours;
    var mins = recipe_details[0]?.cookTime?.minutes;
    if (hours && mins) {
      return hours + " hour and " + mins + " minutes";
    }
    if (!hours && mins) {
      return mins + " minutes";
    }
    if (hours && !mins) {
      return hours + " hours";
    }
    if (!hours && !mins) {
      return "No recipe time";
    }
  }

  return (
    <>
      <div className="container">
        <div className="row justify-content-end gap-1">
          <div className="col d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              type="button"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#updateBackdrop"
            >
              <img src="../../edit-icon.svg" /> Edit
            </button>
          </div>
          <UpdateRecipe
            recipe_name={recipe_name}
            triggerRefresh={triggerRefresh}
          />
          <button
            type="button"
            className="col-auto btn btn-danger"
            onClick={() => deleteRecipe()}
          >
            <img src="../../delete-icon.svg" />
            Delete
          </button>
        </div>
      </div>
      <div className="custom-container">
        <h1>{recipe_details[0].name}</h1>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Recipe steps:</h2>
          {recipe_details[0].steps
            .split("\n")
            .filter((line: string) => line.trim() !== "") // Remove empty lines
            .map((line: string, index: number) => (
              <div key={index}>
                {index + 1}. {line}
              </div>
            ))}
        </div>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Ingredients:</h2>
          <ul>
            {Object.entries(recipe_details[0].ingredients).map(
              ([ingredientName, value], index) => {
                const [quantity, unit] = Array.isArray(value)
                  ? value
                  : [value, ""]; // Ensure it's an array
                return (
                  <li key={index}>
                    {quantity} {unit ? `${unit} of` : ""} {ingredientName}
                  </li>
                );
              }
            )}
          </ul>
        </div>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Ratings:</h2>
          <ul>
            <li>
              <h4>
                Vanessa:{" "}
                {recipe_details[0]?.ranking?.vanessa
                  ? recipe_details[0]?.ranking?.vanessa + "/10"
                  : "No rating"}
              </h4>
            </li>
            <li>
              <h4>
                Farid:{" "}
                {recipe_details[0]?.ranking?.farid
                  ? recipe_details[0]?.ranking?.farid + "/10"
                  : "No rating"}
              </h4>
            </li>
          </ul>
        </div>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Cook time:</h2>
          <p>
            <CookTimeParse />
          </p>
        </div>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Last cooked:</h2>
          <p>{recipe_details[0]?.dateAdded?.split("T")[0] ?? "No date"}</p>
        </div>
        <div></div>
        <div className="p-3 mb-2 bg-light text-dark border border-2 border-dark-subtle rounded-4">
          <h2>Link:</h2>
          <p>{recipe_details[0]?.link ?? "No link"}</p>
        </div>
      </div>
    </>
  );
};

export default RecipeDetails;
