"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";


export default function SignupPage() {
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await signup(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Navbar */}
      <nav className="w-full max-w-md p-4 flex justify-between bg-white shadow-md rounded-xl">
        <Link href="/" className="font-semibold text-lg">Home</Link>
        <Link href="/login" className="font-semibold text-lg">Login</Link>
      </nav>
      
      {/* Login Card */}
      <div className="w-full max-w-md mt-10 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* <div>
            <label htmlFor="username" className="block text-sm font-medium">Username:</label>
            <input id="username" name="username" type="text" required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div> */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email:</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password:</label>
            <input id="password" name="password" type="password" required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Sign Up</button>
        </form>
        <div className="text-center mt-4 text-sm">
          <p>
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}