"use client";

import Link from "next/link";
import { FaSun } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { createBrowserSupabase } from "../../../utils/supabase/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const supabase = createBrowserSupabase();

export default function HomePage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(""); // Default: All Categories

  // Fetch Blogs with category filter
  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from("blogs").select("*, categories(name)");

      if (selectedCategory) {
        query = query.eq("category_id", parseInt(selectedCategory));
      }

      const { data, error } = await query;
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]); // Runs whenever selectedCategory changes

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold bg-gray-100">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 tracking-tight">
          <FaSun className="text-yellow-500" />
          <span>Aftab</span>
        </div>
        <div className="flex gap-3">
          <Link href="/signup" className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg hover:bg-gray-50">
            Sign Up
          </Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
            Login
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="max-w-6xl mx-auto mb-8 bg-white shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome to Aftab Platform</h1>
        <p className="text-gray-600 mt-2 text-lg">Explore the latest blogs and insights.</p>
      </section>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Category Filter */}
        <div className="bg-white shadow-lg rounded-xl p-5 md:col-span-3">
          <div className="flex items-center justify-between">
            <label className="block text-gray-700 font-medium">Filter by Category:</label>
            <select
              className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="md:col-span-3 bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
            Latest Blogs
            {data.length > 0 && (
              <span className="text-lg font-normal text-gray-500 ml-2">({data.length})</span>
            )}
          </h2>
          <div className="space-y-6">
            {data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition duration-300"
                >
                  <Link href={`/blog/${item.id}`}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                  </Link>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {item.categories?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-gray-500 mt-4">
                  No blogs found for the selected category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}