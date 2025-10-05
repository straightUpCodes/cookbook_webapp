import { useEffect, useState } from "react";
import CreateRecipe from "../components/CreateRecipe.tsx";
import UpdateRecipe from "../components/UpdateRecipe";
const apiUrl = import.meta.env.VITE_API_URL;

const RecipeTable = ({
  onRecipeUpdate,
  processCartFlag,
}: {
  onRecipeUpdate: (recipeName: any) => void;
  processCartFlag: Boolean | undefined;
}) => {
  const [allRawRecipes, setAllRawRecipes] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  type RecipeEntry = {
    name: string;
    category: string;
    vanessaRating: number;
    faridRating: number;
    cookTime: number;
    dateAdded: Date;
  };

  const [recipesArray, setRecipesArray] = useState<RecipeEntry[]>([]);
  const [pastKey, setPastKey] = useState<string>("");
  const [sortedRecipes, setSortedRecipes] = useState<RecipeEntry[]>([]);
  const [staleSortDirection, setStaleSortDirection] = useState<Boolean>(true);
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [pastRecipeAdded, setPastRecipeAdded] = useState<string>("");

  const triggerRefresh = () => {
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/allrecipes`, {})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        return response.json();
      })
      .then((data) => {
        setAllRawRecipes(data);
      })
      .catch((err) => {
        console.error("Failed to fetch recipe data " + err);
      });
  }, [refresh, processCartFlag]);

  useEffect(() => {
    const transformed = allRawRecipes.map((recipe) => {
      const cookTime =
        (recipe.cookTime?.hours ?? 0) * 60 + (recipe.cookTime?.minutes ?? 0);

      return {
        name: recipe.name,
        category: recipe.category ?? "Unknown Category",
        vanessaRating: recipe.ranking?.vanessa ?? undefined,
        faridRating: recipe.ranking?.farid ?? undefined,
        cookTime: cookTime === 0 ? undefined : cookTime,
        dateAdded: recipe.dateAdded ?? "",
      };
    });

    setRecipesArray(transformed);
    setSortedRecipes(transformed);
  }, [allRawRecipes]);

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

  const HandleSort = (key: string) => {
    var sortDirection = staleSortDirection;

    if (pastKey === key) {
      sortDirection = !sortDirection;
    } else {
      sortDirection = true;
    }
    setStaleSortDirection(sortDirection);
    setPastKey(key);

    var sortedArray = [];

    if (
      key === "vanessaRating" ||
      key === "faridRating" ||
      key === "cookTime"
    ) {
      if (sortDirection === true) {
        sortedArray = [...recipesArray].sort(
          (a, b) =>
            Number(b[key as keyof RecipeEntry] ?? 0) -
            Number(a[key as keyof RecipeEntry] ?? 0)
        );
        setSortedRecipes(sortedArray);
      }
      if (sortDirection === false) {
        sortedArray = [...recipesArray].sort(
          (b, a) =>
            Number(b[key as keyof RecipeEntry] ?? 0) -
            Number(a[key as keyof RecipeEntry] ?? 0)
        );
        setSortedRecipes(sortedArray);
      }
    } else if (key === "dateAdded") {
      if (sortDirection === true) {
        sortedArray = [...recipesArray].sort((a, b) => {
          const aDate = new Date(
            a[key as keyof RecipeEntry] as string
          ).getTime();
          const bDate = new Date(
            b[key as keyof RecipeEntry] as string
          ).getTime();
          return bDate - aDate;
        });
        setSortedRecipes(sortedArray);
      }
      if (sortDirection === false) {
        sortedArray = [...recipesArray].sort((b, a) => {
          const aDate = new Date(
            a[key as keyof RecipeEntry] as string
          ).getTime();
          const bDate = new Date(
            b[key as keyof RecipeEntry] as string
          ).getTime();
          return bDate - aDate;
        });
        setSortedRecipes(sortedArray);
      }
    } else {
      if (sortDirection === false) {
        sortedArray = [...recipesArray].sort((a, b) => {
          const nameA = a[key as keyof RecipeEntry];
          const nameB = b[key as keyof RecipeEntry];
          if (nameA < nameB) return 1;
          if (nameA > nameB) return -1;
          return 0;
        });
        setSortedRecipes(sortedArray);
      } else if (sortDirection === true) {
        sortedArray = [...recipesArray].sort((b, a) => {
          const nameA = a.name;
          const nameB = b.name;
          if (nameA < nameB) return 1;
          if (nameA > nameB) return -1;
          return 0;
        });
        setSortedRecipes(sortedArray);
      } else {
        console.log("Error in sort");
      }
    }
  };

  function handleEditClick(recipeSelected: string) {
    setSelectedRecipe(recipeSelected);
  }

  return (
    <>
      <CreateRecipe triggerRefresh={triggerRefresh} />
      <br></br>
      <table className="table table-striped table-bordered">
        <thead className="table-secondary">
          <tr>
            <th
              scope="col"
              onClick={() => HandleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Name
            </th>
            <th
              scope="col"
              onClick={() => HandleSort("category")}
              style={{ cursor: "pointer" }}
            >
              Category
            </th>
            <th
              scope="col"
              onClick={() => HandleSort("vanessaRating")}
              style={{ cursor: "pointer" }}
            >
              Vanessa's Rating
            </th>
            <th
              scope="col"
              onClick={() => HandleSort("faridRating")}
              style={{ cursor: "pointer" }}
            >
              Farid's Rating
            </th>
            <th
              scope="col"
              onClick={() => HandleSort("cookTime")}
              style={{ cursor: "pointer" }}
            >
              Cooking Time (mins)
            </th>
            <th
              scope="col"
              onClick={() => HandleSort("dateAdded")}
              style={{ cursor: "pointer" }}
            >
              Date Added
            </th>
            <th scope="col">Add to List</th>
            <th scope="col">Update</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecipes.map((recipe) => (
            <tr key={recipe.name}>
              <td>
                <a href={`/recipe/${recipe.name}`}>{recipe.name}</a>
              </td>
              <td>{recipe.category}</td>
              <td>
                {recipe.vanessaRating ? recipe.vanessaRating + "/10" : null}
              </td>
              <td>{recipe.faridRating ? recipe.faridRating + "/10" : null}</td>
              <td>{recipe.cookTime}</td>
              <td>{String(recipe.dateAdded).split("T")[0]}</td>
              <td style={{ textAlign: "center" }}>
                <button
                  onClick={() => handleAddCart(recipe.name)}
                  className="btn btn-secondary"
                >
                  <img src="../../add_cart-icon.svg" alt="Add to List" />
                </button>
              </td>
              <td>
                <div className="col d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#updateBackdrop"
                    onClick={() => handleEditClick(recipe.name)}
                  >
                    <img src="../../edit-icon.svg" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UpdateRecipe
        recipe_name={selectedRecipe}
        triggerRefresh={triggerRefresh}
      />
    </>
  );
};

export default RecipeTable;
