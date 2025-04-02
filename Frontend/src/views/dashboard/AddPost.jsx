import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";

function AddPost() {
    const [post, setCreatePost] = useState({
        image: "",
        title: "",
        description: "",
        category: "",
        tags: "",
        status: "",
        taggedUsers: [], // Store selected users
    });
    const [imagePreview, setImagePreview] = useState("");
    const [categoryList, setCategoryList] = useState([]);
    const [userList, setUserList] = useState([]); // Store all users
    const [isLoading, setIsLoading] = useState(false);
    const [showUserList, setShowUserList] = useState(false); // Control visibility of user list
    const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered users based on input
    const [tagInput, setTagInput] = useState(""); // Store the input for tagging users
    const userId = useUserData()?.user_id;
    const navigate = useNavigate();

    // Fetch categories
    useEffect(() => {
        async function fetchCategory() {
            try {
                const response = await apiInstance.get("post/category/list/");
                setCategoryList(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        fetchCategory();
    }, []);

    // Fetch all users for tagging
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await apiInstance.get("users/list/"); // Replace with your actual API endpoint
                setUserList(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchUsers();
    }, []);

    const handleCreatePostChange = (event) => {
        setCreatePost({
            ...post,
            [event.target.name]: event.target.value,
        });
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        const reader = new FileReader();

        setCreatePost({
            ...post,
            image: {
                file: selectedFile,
                preview: reader.result,
            },
        });

        reader.onloadend = () => {
            setImagePreview(reader.result);
        };

        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
        }
    };

    // Handle input change for tagging users
    const handleTagInputChange = (event) => {
        const inputValue = event.target.value;
        setTagInput(inputValue);

        // Show user list when '@' is typed
        if (inputValue.includes("@")) {
            setShowUserList(true);
            const searchTerm = inputValue.split("@").pop().trim().toLowerCase();
            const filtered = userList.filter((user) =>
                user.full_name.toLowerCase().includes(searchTerm)
            );
            setFilteredUsers(filtered);
        } else {
            setShowUserList(false);
        }
    };

    // Handle user selection from the list
    const handleUserSelect = (user) => {
        const updatedTaggedUsers = [...post.taggedUsers, user.id];
        setCreatePost({ ...post, taggedUsers: updatedTaggedUsers });

        // Update the input field with the selected user's name
        setTagInput((prevInput) => {
            const inputParts = prevInput.split("@");
            inputParts[inputParts.length - 1] = user.full_name;
            return inputParts.join("@") + " ";
        });

        setShowUserList(false); // Hide the user list after selection
    };

    const handleCreatePost = async (e) => {
        setIsLoading(true);
        e.preventDefault();

        if (!post.title || !post.description || !post.image) {
            Toast("error", "All Fields Are Required To Create A Post");
            setIsLoading(false);
            return;
        }

        if (!userId) {
            Toast("error", "User ID not found");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("title", post.title);
        formData.append("image", post.image.file);
        formData.append("description", post.description);
        formData.append("tags", post.tags);
        formData.append("category", post.category);
        formData.append("post_status", post.status);

        // Append tagged users as a list
        post.taggedUsers.forEach((user) => {
            formData.append("tagged_users", user);  // Ensure these are user IDs, not user objects
        });

        try {
            const response = await apiInstance.post("DashboardPostCreate/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(response.data);
            Swal.fire({
                icon: "success",
                title: "Post created successfully.",
            });

            navigate("/posts/");
        } catch (error) {
            console.error("Error creating post:", error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div className="row mt-0 mt-md-4">
                        <div className="col-lg-12 col-md-8 col-12">
                            <>
                                <section className="py-4 py-lg-6 bg-primary rounded-3">
                                    <div className="container">
                                        <div className="row">
                                            <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                                                <div className="d-lg-flex align-items-center justify-content-between">
                                                    <div className="mb-4 mb-lg-0">
                                                        <h1 className="text-white mb-1">Create Blog Post</h1>
                                                        <p className="mb-0 text-white lead">Use the article builder below to write your article.</p>
                                                    </div>
                                                    <div>
                                                        <Link to="/posts/" className="btn" style={{ backgroundColor: "white" }}>
                                                            <i className="fas fa-arrow-left"></i> Back to Posts
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <form onSubmit={handleCreatePost} className="pb-8 mt-5">
                                    <div className="card mb-3">
                                        <div className="card-header border-bottom px-4 py-3">
                                            <h4 className="mb-0">Basic Information</h4>
                                        </div>
                                        <div className="card-body">
                                            <label className="form-label">Preview</label>
                                            <img
                                                style={{ width: "100%", height: "330px", objectFit: "cover", borderRadius: "10px" }}
                                                className="mb-4"
                                                src={imagePreview || "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"}
                                                alt="Preview"
                                            />
                                            <div className="mb-3">
                                                <label className="form-label">Thumbnail</label>
                                                <input onChange={handleFileChange} name="image" className="form-control" type="file" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Title</label>
                                                <input
                                                    onChange={handleCreatePostChange}
                                                    name="title"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Enter title"
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Post Category</label>
                                                <select name="category" onChange={handleCreatePostChange} className="form-select">
                                                    <option value="">-------------</option>
                                                    {categoryList?.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Post Description</label>
                                                <textarea
                                                    onChange={handleCreatePostChange}
                                                    name="description"
                                                    className="form-control"
                                                    rows="5"
                                                ></textarea>
                                            </div>

                                            <label className="form-label">Tags</label>
                                            <input
                                                onChange={handleCreatePostChange}
                                                name="tags"
                                                className="form-control"
                                                type="text"
                                                placeholder="health, medicine, fitness"
                                            />

                                            <label className="form-label">Tag Users</label>
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={handleTagInputChange}
                                                className="form-control"
                                                placeholder="Type '@' to tag users"
                                            />
                                            {showUserList && (
                                                <div className="user-list-dropdown">
                                                    {filteredUsers.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="user-list-item"
                                                            onClick={() => handleUserSelect(user)}
                                                        >
                                                            {user.full_name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <button className="btn btn-lg btn-success w-100" type="submit" disabled={isLoading}>
                                                    {isLoading ? "Creating Post..." : "Create Post"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default AddPost;
