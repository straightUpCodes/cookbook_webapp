import React, { useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

function AddCategory({ fetchCategories }: { fetchCategories: () => void }) {
  const [categoryToAdd, setCategoryToAdd] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from refreshing the page
    sendCategory();
  };

  const sendCategory = async () => {
    try {
      await fetch(`${apiUrl}/api/category/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: categoryToAdd,
        }),
      });
      console.log(apiUrl);
      setCategoryToAdd(""); // Clear input field
      fetchCategories(); // Fetch the updated category list after successful addition
    } catch (error) {
      console.error("Error sending recipe:", error);
    }
  };

  return (
    <>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#staticBackdrop"
        >
          Create Category
        </button>
      </div>
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Create Category
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
                  <label htmlFor="categoryName" className="form-label">
                    Category Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={categoryToAdd}
                    onChange={(e) => setCategoryToAdd(e.target.value)} // Update state on input change
                  />
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
export default AddCategory;
