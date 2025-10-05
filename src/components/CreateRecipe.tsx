import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

function CreateRecipeForm({ triggerRefresh }: { triggerRefresh: () => void }) {
  const { category } = useParams();
  const [recipeName, setRecipeName] = useState<string>(""); // Store recipe name
  const [recipeSteps, setRecipeSteps] = useState<string>("");
  const [ingredientName, setIngredientName] = useState<string[]>([]);
  const [ingredientQuantity, setIngredientQuantity] = useState<string[]>([]);
  const [ingredientUnit, setIngredientUnit] = useState<string[]>([]);
  const [fullIngredients, setFullIngredients] = useState<{
    [key: string]: [string, string];
  }>({});
  const [recipeLink, setRecipeLink] = useState<string>(""); // Store recipe name
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
  const [formCategory, setFormCategory] = useState<string | undefined>(
    category
  ); // Store selected category

  function handleIngredientChange(ingredient: {
    name: string;
    quantity: string;
    unit: string;
  }) {
    setIngredientName((prev) => [...prev, ingredient.name]);
    setIngredientQuantity((prev) => [...prev, ingredient.quantity]);
    setIngredientUnit((prev) => [...prev, ingredient.unit]);
    setFullIngredients((prev) => ({
      ...prev,
      [ingredient.name]: [ingredient.quantity, ingredient.unit],
    }));
  }

  useEffect(() => {
    var currentWindow = window.location.href.split("/");
    var parentPage = currentWindow[currentWindow.length - 2];

    if (parentPage === "recipes") {
      setFormCategory(category);
    }
  }, [category]);

  function GenerateTable() {
    if (ingredientName.length === 0) {
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
            </tr>
          </thead>
          <tbody>
            {ingredientName.map((name, index) => (
              <tr key={index}>
                <td>{name}</td>
                <td>{ingredientQuantity[index]}</td>
                <td>{ingredientUnit[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page

    var fullRecipe = {
      name: recipeName,
      steps: recipeSteps,
      ingredients: fullIngredients,
      category: formCategory,
      link: recipeLink,
      ranking: { vanessa: recipeVanessaRanking, farid: recipeFaridRanking },
      cookTime: { hours: recipeCookHours, minutes: recipeCookMinutes },
    };
    sendRecipe(fullRecipe);
    setRecipeName("");
    setRecipeSteps("");
    setIngredientName([]);
    setIngredientQuantity([]);
    setIngredientUnit([]);
    setFullIngredients({});
    setRecipeCookHours(null);
    setRecipeCookMinutes(null);
    setRecipeLink("");
    setRecipeVanessaRanking(null);
    setRecipeFaridRanking(null);
    setFormCategory(category);
  };
  const sendRecipe = async (fullRecipe: Object) => {
    try {
      await fetch(`${apiUrl}/api/recipe/add`, {
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

  const handleCategorySelect = (selectedCategory: string) => {
    setFormCategory(selectedCategory); // Update the selected category in the parent
  };

  return (
    <>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#createBackdrop"
        >
          Create Recipe
        </button>
      </div>
      <div
        className="modal fade"
        id="createBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="createBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="createBackdropLabel">
                Create recipe
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
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)} // Update state on input change
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
                    value={recipeSteps}
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
                    value={recipeLink}
                    onChange={(e) => setRecipeLink(e.target.value)} // Update state on input change
                  />
                </div>
                <div className="mb-3">
                  <GetCategories
                    onCategorySelect={handleCategorySelect}
                    updatedCategory={formCategory}
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
                <button type="submit" className="btn btn-primary ">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
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
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
        ></input>
      </div>
      <div className="col">
        <input
          type="text"
          className="form-control"
          placeholder="Quanitity"
          id="ingredientQuantity"
          value={ingredientQuantity}
          onChange={(e) => setIngredientQuantity(e.target.value)}
        ></input>
      </div>
      <div className="col">
        <UnitSelector onUnitSelect={(unit) => setIngredientUnit(unit)} />
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

import { useRef } from "react";

function UnitSelector({
  onUnitSelect,
}: {
  onUnitSelect: (unit: string) => void;
}) {
  const [units, setUnits] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/units`)
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        setFilteredUnits(data);
      })
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  useEffect(() => {
    const filtered = units.filter((unit) =>
      unit.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredUnits(filtered);
  }, [input, units]);

  // Close dropdown on outside click
  useEffect(() => {
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

function GetCategories({
  onCategorySelect,
  updatedCategory,
}: {
  onCategorySelect: (formCategory: string) => void;
  updatedCategory: string | undefined;
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

  const handleCategorySelect = (formCategory: string) => {
    setSelectedCategory(formCategory); // Set the selected category
    onCategorySelect(formCategory);
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

export default CreateRecipeForm;
