import { useState, useEffect } from "react";
import "../App.css";
const apiUrl = import.meta.env.VITE_API_URL;

import React from "react";
import { useRef } from "react";

type IngredientRowProps = {
  name: string;
  quantity: string;
  unit: string;
  onChange: (ingredient: {
    name: string;
    quantity: string;
    unit: string;
  }) => void;
  onDelete: (name: string) => void;
};

const IngredientRow = React.memo(
  function IngredientRow({
    name,
    quantity,
    unit,
    onChange,
    onDelete,
  }: IngredientRowProps) {
    const [localQuantity, setLocalQuantity] = React.useState<string>(quantity);
    const [localUnit, setLocalUnit] = React.useState<string>(unit);
    // Update local state if prop changes
    React.useEffect(() => {
      setLocalQuantity(quantity);
    }, [quantity]);
    React.useEffect(() => {
      setLocalUnit(unit);
    }, [unit]);
    return (
      <tr>
        <td>{name}</td>
        <td>
          <input
            type="text"
            className="form-control"
            placeholder="Quantity"
            value={localQuantity}
            onChange={(e) => setLocalQuantity(e.target.value)}
            onBlur={() =>
              onChange({
                name,
                quantity: localQuantity,
                unit: localUnit,
              })
            }
          />
        </td>
        <td>
          <UnitSelector
            value={localUnit}
            onUnitSelect={(selectedUnit) => {
              setLocalUnit(selectedUnit);
              // Call onChange to propagate change
              onChange({
                name,
                quantity: localQuantity,
                unit: selectedUnit,
              });
            }}
          />
        </td>
        <td>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(name)}
          >
            <img src="../../delete-icon.svg" />
          </button>
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) =>
    prevProps.quantity === nextProps.quantity &&
    prevProps.unit === nextProps.unit
);

function UpdateRecipe({
  recipe_name,
  triggerRefresh,
}: {
  recipe_name: string | undefined;
  triggerRefresh: () => void;
}) {
  const [recipeName, setRecipeName] = useState<string>(""); // Store recipe name
  const [recipeSteps, setRecipeSteps] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null); // Store selected category
  const [fullIngredients, setFullIngredients] = useState<{
    [key: string]: [string, string];
  }>({});
  const [recipeLink, setRecipeLink] = useState<string>("");
  const [recipeVanessaRanking, setRecipeVanessaRanking] = useState<
    string | null
  >(null);
  const [recipeFaridRanking, setRecipeFaridRanking] = useState<string | null>(
    null
  );
  const [recipeCookHours, setRecipeCookHours] = useState<string | null>(null);
  const [recipeCookMinutes, setRecipeCookMinutes] = useState<string | null>(
    null
  );
  const [recipeLastCooked, setRecipeLastCooked] = useState<string | null>(null);

  const [recipeDetails, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (recipeDetails.length > 0) {
      setRecipeName(recipeDetails[0].name);
      setRecipeSteps(recipeDetails[0].steps);
      setFullIngredients(recipeDetails[0].ingredients);
      setCategory(recipeDetails[0].category);
      setRecipeLink(recipeDetails[0].link);
      setRecipeVanessaRanking(
        recipeDetails[0]?.ranking?.vanessa !== undefined &&
          recipeDetails[0]?.ranking?.vanessa !== null
          ? String(recipeDetails[0]?.ranking?.vanessa)
          : null
      );
      setRecipeFaridRanking(
        recipeDetails[0]?.ranking?.farid !== undefined &&
          recipeDetails[0]?.ranking?.farid !== null
          ? String(recipeDetails[0]?.ranking?.farid)
          : null
      );
      setRecipeCookHours(
        recipeDetails[0]?.cookTime?.hours !== undefined &&
          recipeDetails[0]?.cookTime?.hours !== null
          ? String(recipeDetails[0]?.cookTime?.hours)
          : null
      );
      setRecipeCookMinutes(
        recipeDetails[0]?.cookTime?.minutes !== undefined &&
          recipeDetails[0]?.cookTime?.minutes !== null
          ? String(recipeDetails[0]?.cookTime?.minutes)
          : null
      );
    }
    setRecipeLastCooked(
      recipeDetails[0]?.dateAdded
        ? new Date(recipeDetails[0].dateAdded).toISOString().split("T")[0]
        : null
    );
  }, [recipeDetails]);

  useEffect(() => {
    if (recipe_name) {
      fetch(`${apiUrl}/api/recipe/${recipe_name}`, {})
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch recipe");
          }
          return response.json();
        })
        .then((data) => {
          setRecipes(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [recipe_name]);

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory); // Update the selected category in the parent
  };

  function handleIngredientChange(ingredient: {
    name: string;
    quantity: string;
    unit: string;
  }) {
    setFullIngredients((prev) => {
      if (
        prev[ingredient.name]?.[0] === ingredient.quantity &&
        prev[ingredient.name]?.[1] === ingredient.unit
      ) {
        return prev; // no change, return same reference
      }
      return {
        ...prev,
        [ingredient.name]: [ingredient.quantity, ingredient.unit],
      };
    });
  }

  function GenerateTable() {
    if (Object.keys(fullIngredients).length === 0) {
      return null;
    }
    return (
      <>
        <label htmlFor="ingredientList" className="form-label">
          Ingredient List
        </label>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Quantity</th>
              <th scope="col">Unit</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fullIngredients).map(([name, [quantity, unit]]) => (
              <IngredientRow
                key={name}
                name={name}
                quantity={quantity}
                unit={unit}
                onChange={handleIngredientChange}
                onDelete={deleteIngredient}
              />
            ))}
          </tbody>
        </table>
      </>
    );
  }

  function deleteIngredient(ingredientToDelete: string) {
    const { [ingredientToDelete]: removed, ...newIngredients } =
      fullIngredients;
    setFullIngredients(newIngredients); // Update the state with the new object without the deleted key
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page
    var fullRecipe = {
      name: recipeName,
      steps: recipeSteps,
      ingredients: fullIngredients,
      category: category,
      link: recipeLink,
      dateAdded:
        recipeLastCooked && recipeLastCooked !== ""
          ? new Date(recipeLastCooked)
          : null,
      ranking: {
        vanessa:
          recipeVanessaRanking && recipeVanessaRanking !== ""
            ? Number(recipeVanessaRanking)
            : null,
        farid:
          recipeFaridRanking && recipeFaridRanking !== ""
            ? Number(recipeFaridRanking)
            : null,
      },
      cookTime: {
        hours:
          recipeCookHours && recipeCookHours !== ""
            ? Number(recipeCookHours)
            : null,
        minutes:
          recipeCookMinutes && recipeCookMinutes !== ""
            ? Number(recipeCookMinutes)
            : null,
      },
    };
    sendRecipe(fullRecipe);
  };

  const sendRecipe = async (fullRecipe: Object) => {
    try {
      await fetch(`${apiUrl}/api/recipe/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullRecipe),
      });
      triggerRefresh();
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  return (
    <>
      <div
        className="modal fade"
        id="updateBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="updateBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="updateBackdropLabel">
                Edit recipe
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="recipeName" className="form-label">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipeName"
                    value={recipeName ?? " what the fuck "}
                    onChange={(e) => {
                      setRecipeName(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="recipeSteps" className="form-label">
                    Recipe Steps
                  </label>
                  <textarea
                    className="form-control"
                    id="recipeSteps"
                    rows={3}
                    value={recipeSteps ?? ""}
                    onChange={(e) => setRecipeSteps(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-3"></div>
                <div>
                  <GenerateTable />
                </div>
                <div className="mb-3">
                  <label htmlFor="addIngredients" className="form-label">
                    Add Ingredients
                  </label>
                  <AddIngredients onIngredientChange={handleIngredientChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="recipeLink" className="form-label">
                    Recipe Link
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipeLink"
                    value={recipeLink ?? ""}
                    onChange={(e) => setRecipeLink(e.target.value)} // Update state on input change
                  />
                </div>
                <div className="mb-3">
                  <GetCategories
                    onCategorySelect={handleCategorySelect}
                    updatedCategory={category}
                  />
                </div>
                <div className="row">
                  <div className="col mb-3">
                    <label
                      htmlFor="recipeVanessaRanking"
                      className="form-label"
                    >
                      Vanessa's Rating
                    </label>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="recipeFaridRanking" className="form-label">
                      Farid's Rating
                    </label>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="recipeCookHours" className="form-label">
                      Cooking Time (hr)
                    </label>
                  </div>
                  <div className="col mb-3">
                    <label htmlFor="recipeCookMinutes" className="form-label">
                      Cooking Time (minutes)
                    </label>
                  </div>
                </div>
                <div className="row">
                  <div className="col mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="recipeVanessaRanking"
                      value={recipeVanessaRanking ?? ""}
                      onChange={(e) => setRecipeVanessaRanking(e.target.value)}
                    />
                  </div>
                  <div className="col mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="recipeFaridRanking"
                      value={recipeFaridRanking ?? ""}
                      onChange={(e) => setRecipeFaridRanking(e.target.value)}
                    />
                  </div>
                  <div className="col mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="recipeCookHours"
                      value={recipeCookHours ?? ""}
                      onChange={(e) => setRecipeCookHours(e.target.value)}
                    />
                  </div>
                  <div className="col mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="recipeCookMinutes"
                      value={recipeCookMinutes ?? ""}
                      onChange={(e) => setRecipeCookMinutes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="recipeLastCooked" className="form-label">
                    Last Cooked
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="recipeLastCooked"
                    value={recipeLastCooked ?? ""}
                    onChange={(e) => setRecipeLastCooked(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary "
                  data-bs-dismiss="modal"
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function GetCategories({
  onCategorySelect,
  updatedCategory,
}: {
  onCategorySelect: (category: string) => void;
  updatedCategory: string | null;
}) {
  const [categories, setCategories] = useState<any[]>([]); // Store categories
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [, setSelectedCategory] = useState<string | null>(null); // Store selected category

  // Fetch data on component mount
  useEffect(() => {
    fetch(`${apiUrl}/api/categories`, {}) // Call your API
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
  }, []); // Empty dependency array to run this only once when component mounts

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category); // Set the selected category
    onCategorySelect(category);
  };

  if (loading) return <p>Loading...</p>; // Display loading text
  if (error) return <p>Error: {error}</p>; // Display error if any

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {updatedCategory}
      </button>
      <ul className="dropdown-menu">
        {Object.keys(categories[0]).map((key) => {
          if (key === "_id") {
            return null;
          }
          return (
            <li key={key}>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => handleCategorySelect(key)} // Set category on click
              >
                {key}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddIngredients({
  onIngredientChange,
}: {
  onIngredientChange: (ingredient: {
    name: string;
    quantity: string;
    unit: string;
  }) => void;
}) {
  const [ingredientName, setIngredientName] = useState<string>("");
  const [ingredientQuantity, setIngredientQuantity] = useState<string>("");
  const [ingredientUnit, setIngredientUnit] = useState<string>("");

  function handleAdd() {
    const newIngredient = {
      name: ingredientName,
      quantity: ingredientQuantity,
      unit: ingredientUnit,
    };
    onIngredientChange(newIngredient); // Send data to parent

    // Clear input fields after adding
    setIngredientName("");
    setIngredientQuantity("");
    setIngredientUnit("");
  }

  return (
    <div className="row">
      <div className="col">
        <input
          type="text"
          className="form-control"
          placeholder="Name"
          id="ingredientName"
          value={ingredientName ?? ""}
          onChange={(e) => setIngredientName(e.target.value)}
        ></input>
      </div>
      <div className="col">
        <input
          type="text"
          className="form-control"
          placeholder="Quanitity"
          id="ingredientQuantity"
          value={ingredientQuantity ?? ""}
          onChange={(e) => setIngredientQuantity(e.target.value)}
        ></input>
      </div>
      <div className="col">
        <UnitSelector
          value={ingredientUnit} // Pass the current unit
          onUnitSelect={(unit) => setIngredientUnit(unit)}
        />
      </div>
      <div className="col-auto">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleAdd()}
        >
          <img src="../../add-icon.svg" alt="Add" />
        </button>
      </div>
    </div>
  );
}
export default UpdateRecipe;

// UnitSelector component (adapted from CreateRecipe.tsx)
function UnitSelector({
  onUnitSelect,
  value,
}: {
  onUnitSelect: (unit: string) => void;
  value?: string;
}) {
  const [units, setUnits] = React.useState<string[]>([]);
  const [input, setInput] = React.useState<string>(value ?? "");
  const [filteredUnits, setFilteredUnits] = React.useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    fetch(`${apiUrl}/api/units`)
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        setFilteredUnits(data);
      })
      .catch((err) => console.error("Error fetching units:", err));
  }, []);
  React.useEffect(() => {
    const filtered = units.filter((unit) =>
      unit.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredUnits(filtered);
  }, [input, units]);
  // Update input if value prop changes (e.g. on edit)
  React.useEffect(() => {
    setInput(value ?? "");
  }, [value]);
  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);
  const handleSelect = async (unit: string) => {
    // If the typed unit doesn't exist, create it
    if (!units.includes(unit)) {
      try {
        await fetch(`${apiUrl}/api/unit/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitName: unit }),
        });
        setUnits((prev) => [...prev, unit]);
      } catch (err) {
        console.error("Error adding unit:", err);
      }
    }
    onUnitSelect(unit);
    setInput(unit);
    setIsDropdownOpen(false);
  };
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };
  return (
    <div
      className="dropdown"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <input
        type="text"
        className="form-control"
        placeholder="Unit"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={handleInputFocus}
        autoComplete="off"
      />
      {isDropdownOpen && (
        <ul
          className="dropdown-menu show"
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            width: "100%",
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
          }}
        >
          {filteredUnits.map((unit) => (
            <li
              key={unit}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="dropdown-item"
                type="button"
                onClick={() => handleSelect(unit)}
                style={{ flexGrow: 1, textAlign: "left" }}
              >
                {unit}
              </button>
              <button
                className="btn btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "2rem",
                  width: "2rem",
                  padding: 5,
                  marginTop: "0.1rem",
                  marginBottom: "0.1rem",
                }}
                type="button"
                onClick={async (e) => {
                  e.stopPropagation(); // Prevent triggering handleSelect
                  try {
                    await fetch(`${apiUrl}/api/unit/delete`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ unitName: unit }),
                    });
                    setUnits((prev) => prev.filter((u) => u !== unit));
                    setFilteredUnits((prev) => prev.filter((u) => u !== unit));
                  } catch (err) {
                    console.error("Error deleting unit:", err);
                  }
                }}
              >
                ×
              </button>
            </li>
          ))}
          {input && !units.includes(input) && (
            <li>
              <button
                className="dropdown-item text-primary"
                type="button"
                onClick={() => handleSelect(input)}
              >
                Add "{input}"
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
