import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CreateRecipe from "../components/CreateRecipe.tsx";
const apiUrl = import.meta.env.VITE_API_URL;

const RecipeList = ({
  onRecipeUpdate,
}: {
  onRecipeUpdate: (recipeName: any) => void;
}) => {
  const { category } = useParams();
  const [recipe_list, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [pastRecipeAdded, setPastRecipeAdded] = useState<string>("");

  const triggerRefresh = () => {
    setRefresh((prev) => !prev); // Toggle refresh to trigger useEffect re-fetch
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/recipes/${category}`, {})
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
  }, [refresh, category]); // Added category as a dependency

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  function handleAddCart(recipeName: any) {
    if (recipeName === pastRecipeAdded) {
      onRecipeUpdate(""); // Clear
      setTimeout(() => {
        onRecipeUpdate(recipeName);
      }, 0);
    } else {
      onRecipeUpdate(recipeName);
    }
    setPastRecipeAdded(recipeName);
  }

  const handleDelete = async (recipe_name: any) => {
    try {
      await fetch(`${apiUrl}/api/recipe/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: recipe_name }),
      });
      triggerRefresh();
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  return (
    <>
      <CreateRecipe triggerRefresh={triggerRefresh} />
      <div className="list-group">
        <h1>{category}</h1>
        {recipe_list.map((recipe) => (
          <li key={recipe.name} className="list-group-item">
            <div className="row">
              <div className="col">
                <Link
                  to={`/recipe/${recipe.name}`}
                  className="list-group-item list-group-item-action"
                >
                  {recipe.name}
                </Link>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => handleAddCart(recipe.name)}
                >
                  <img src="../../add_cart-icon.svg" alt="Add to List" />
                </button>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => handleDelete(recipe.name)}
                >
                  <img src="../../delete-icon.svg" alt="Delete Recipe" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </div>
    </>
  );
};

export default RecipeList;
