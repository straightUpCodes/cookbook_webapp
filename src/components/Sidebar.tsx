import { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

function Sidebar({
  recipeName,
  onProcessRecipes,
}: {
  recipeName: string | null;
  onProcessRecipes: () => void;
}) {
  const [recipeList, setrecipeList] = useState<string[]>([]);
  const [ingredientList, setIngredientList] = useState<{
    [key: string]: { quantity: number; unit: string };
  }>({});
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    handleCartAddSidebar();
  }, [recipeName]);

  useEffect(() => {
    fetchRecipeIngredients();
  }, [refresh]);

  const handleCartAddSidebar = () => {
    if (recipeName) {
      setrecipeList((prev) => [...prev, recipeName]);
      setRefresh(!refresh);
    }
  };

  function removeRecipe(recipeToRemove: string) {
    if (recipeList) {
      const newRecipeList = recipeList.filter(
        (recipe) => recipe !== recipeToRemove
      );
      setrecipeList(newRecipeList);
      setRefresh(!refresh);
    }
  }

  const fetchRecipeIngredients = async () => {
    var recipeNames = { name: { $in: recipeList } };
    try {
      const response = await fetch(`${apiUrl}/api/incart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeNames),
      });
      const data = await response.json();
      parseIngredients(data);
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  const updateDates = async () => {
    var recipeNames = { name: { $in: recipeList } };
    try {
      await fetch(`${apiUrl}/api/addtocart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeNames),
      });
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
    onProcessRecipes();
  };

  function parseIngredients(fullData: Record<string, any>[]) {
    var combined: { [key: string]: string } = {};
    fullData.map((recipe) => {
      var ingredients = Object.keys(recipe.ingredients);
      ingredients.forEach((key) => {
        var unit = recipe.ingredients[key][1];
        if (combined[key]) {
          var oldQuantity = Number(combined[key].split("|")[0]);
          var quantity = Number(recipe.ingredients[key][0]) + oldQuantity;
          combined[key] = quantity + "|" + unit;
        } else {
          var quantity = Number(recipe.ingredients[key][0]);
          combined[key] = quantity + "|" + unit;
        }
      });
    });
    var combinedList: { [key: string]: { quantity: number; unit: string } } =
      {};

    Object.keys(combined).map((key) => {
      const [quantity, unit] = combined[key].split("|"); // Split the string at the "|"
      combinedList[key] = {
        quantity: Number(quantity),
        unit: unit,
      };
    });
    setIngredientList(combinedList); // Update the state with combined ingredients
  }

  function ListIngredients({
    finalIngredientList,
  }: {
    finalIngredientList: { [key: string]: { quantity: number; unit: string } };
  }) {
    if (recipeList.length > 0) {
      return (
        <>
          <h2>Ingredients</h2>
          <ul className="list-group">
            {Object.keys(finalIngredientList).map((key) => (
              <li className="list-group-item" key={key}>
                {finalIngredientList[key]["quantity"]}{" "}
                {finalIngredientList[key]["unit"]} {key}
              </li>
            ))}
          </ul>
          <br></br>
          <button onClick={updateDates} className="btn btn-primary">
            Log List
          </button>
        </>
      );
    }
    return null;
  }

  function ListToShow() {
    if (recipeList.length > 0) {
      return (
        <>
          <h2>Recipe List</h2>
          <ul className="list-group">
            {recipeList.map((recipeName, index) => (
              <li className="list-group-item" key={index}>
                <div className="row">
                  <div className="col">{recipeName}</div>
                  <div className="col" style={{ maxWidth: "100px" }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => removeRecipe(recipeName)}
                    >
                      <img src="../../delete-icon.svg" alt="Delete" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <br></br>
        </>
      );
    }
    return null;
  }

  return (
    <>
      <ListToShow />
      <ListIngredients finalIngredientList={ingredientList} />
    </>
  );
}

export default Sidebar;
