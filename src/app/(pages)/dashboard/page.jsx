"use client";

import { createClient } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const UserDashboard = () => {
  const { logout } = useAuth();

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null); 
  const router = useRouter()

  // Get current user  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) {
        router.push("/login");
      }
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch Blogs
  const fetchData = async () => {
    try {
      if (!user) return; 
      const { data, error } = await supabase
        .from("blogs")
        .select("*,categories(name)") 
        .eq("user_id", user.id)
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for blogs
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to changes in the blogs table
    const blogsSubscription = supabase
      .channel('blogs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'blogs',
          filter: `user_id=eq.${user.id}` // Only listen to this user's blogs
        },
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // Add new blog to the state
            setData(prevData => [...prevData, {...payload.new, categories: {name: payload.new.category_name || 'Uncategorized'}}]);
            toast.success("Blog Added Successfully")
          } 
          else if (payload.eventType === 'DELETE') {
            // Remove deleted blog from state
            setData(prevData => prevData.filter(item => item.id !== payload.old.id));
            toast.success("Blog Deleted Successfully")
          } 
          // else if (payload.eventType === 'UPDATE') {
          //   // Update modified blog in state
          //   setData(prevData => 
          //     prevData.map(item => 
          //       item.id === payload.new.id 
          //         ? {...payload.new, categories: {name: payload.new.category_name || 'Uncategorized'}} 
          //         : item
          //     )
          //   );
          //   toast.success("Blog Updated Successfully")
          // }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(blogsSubscription);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    } 
  }, [user]); 

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription for categories
  useEffect(() => {
    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prevCategories => [...prevCategories, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setCategories(prevCategories => 
              prevCategories.filter(cat => cat.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === payload.new.id ? payload.new : cat
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesSubscription);
    };
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Insert data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) throw new Error("User not authenticated"); 

      const { error } = await supabase
        .from("blogs")
        .insert([{ title, description, category_id: selectedCategory, user_id: user.id }]); 
      if (error) throw error;

      setTitle("");
      setDescription("");
      setSelectedCategory("");
      // fetchData(); its commented bcz realtime manages it
    } catch (error) {
      console.error("Error inserting data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete data
  const handleDelete = async (id) => {
    if (!id || !user) return; 

    try {
      setLoading(true);

      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); 

      if (error) throw error;
      
      // setData((prevData) => prevData.filter((item) => item.id !== id)); 
      // toast.success("Blog Deleted Successfully")
      
    } catch (error) {
      console.error("Error deleting data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold bg-gray-100">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Insert Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8 h-fit">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
            Create New Blog
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter blog title"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Write your blog description"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Publish Blog"}
            </button>
          </form>
        </div>

        {/* Blogs Section */}
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
            Your Blogs
          </h1>
          <div className="space-y-6">
            {data.length > 0 ? (
              data.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition duration-300"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {item.categories?.name || "Uncategorized"}
                    </span>
                    <button
                      className="bg-red-500 px-4 py-2 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No blogs have been created yet. Start writing!
              </p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserDashboard;