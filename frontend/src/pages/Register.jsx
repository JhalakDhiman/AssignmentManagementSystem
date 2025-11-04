import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from 'react-hot-toast'
import axios from 'axios'
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [accountType, setAccountType] = useState("Student");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const BASE_URL = process.env.REACT_APP_BASE_URL

    const navigate = useNavigate();


    const onSubmit = async (data) => {
        try {
            const payload = { ...data, accountType };

            console.log("📩 Registration Data:", payload);

            const response = await axios.post(
                `${BASE_URL}/auth/signup`,
                payload
            );

            if (response.data.success) {
                toast.success("User registered successfully!");
                console.log("Backend Response:", response.data);
                navigate('/login');
            } else {
                toast.error(response.data.message || "Signup failed");
            }
        } catch (error) {
            console.error(" Error during signup:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-richblue-5 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-richblue-25"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-semibold text-richblue-700">
                        Create Account
                    </h2>
                    <p className="text-richblue-300 mt-1 text-sm">
                        Register as Student or Professor
                    </p>
                </div>

                {/* Toggle Tabs */}
                <div className="flex justify-between bg-richblue-5 border border-richblue-25 rounded-lg p-1 mb-6">
                    {["Student", "Professor"].map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${accountType === type
                                ? "bg-caribbeangreen-100 text-white shadow"
                                : "text-richblue-400 hover:bg-richblue-25"
                                }`}
                            onClick={() => setAccountType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-richblue-600 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            {...register("firstName", { required: "First name is required" })}
                            className="w-full px-3 py-2 border border-richblue-25 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbeangreen-100"
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                            <p className="text-pink-300 text-xs mt-1">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-richblue-600 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            {...register("lastName", { required: "Last name is required" })}
                            className="w-full px-3 py-2 border border-richblue-25 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbeangreen-100"
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                            <p className="text-pink-300 text-xs mt-1">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-richblue-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Enter a valid email address",
                                },
                            })}
                            className="w-full px-3 py-2 border border-richblue-25 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbeangreen-100"
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="text-pink-300 text-xs mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-richblue-600 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                },
                            })}
                            className="w-full px-3 py-2 border border-richblue-25 rounded-lg focus:outline-none focus:ring-2 focus:ring-caribbeangreen-100"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="text-pink-300 text-xs mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.96 }}
                        className="w-full bg-caribbeangreen-100 text-white py-2.5 rounded-lg font-semibold hover:bg-caribbeangreen-200 transition"
                    >
                        Register as {accountType}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-richblue-300 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-caribbeangreen-100 font-semibold hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
