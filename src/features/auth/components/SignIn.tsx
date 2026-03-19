import React, { useState } from "react";
import { FaMicrosoft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import logo from '../../../assets/logo.png';
import abstractimage from '../../../assets/abstractimage.png'
import { useAuth } from "../../../contexts/authContext";
import { Button } from "../../../shared/components/ui/button";

const SignupPage: React.FC = () => {
    const { login, loading, error } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleAzureLogin = async (provider: string) => {
        try {
            setIsLoggingIn(true);
            login();
            // The window.location.href in AuthContext will handle the redirect
        } catch (err) {
            toast.error("Failed to initiate login. Please try again.", {
                position: "top-right",
            });
            setIsLoggingIn(false);
        }
    };

    React.useEffect(() => {
        if (error) {
            toast.error(error, {
                position: "top-right",
            });
        }
    }, [error]);

    return (
        // <div className="min-h-screen bg-stone-100 flex justify-center">
        <div className="min-h-screen bg-stone-300 flex justify-center">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="w-full max-w-5xl bg-white rounded-2xl mt-24 mb-24 shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Section (Form) */}
                <div className="w-full md:w-1/2 p-8 flex flex-col mt-2">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-1 mb-24">
                        <div className="">
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-full h-8 object-cover"
                            />
                        </div>
                    </div>
                    {/* Sign up header and terms */}
                    <div className="mb-14 space-y-2">
                        <h1 className="text-2xl font-bold text-gray-600">
                            Sign up with your identity
                        </h1>
                        <h1 className="text-2xl font-bold text-gray-600">
                             provider
                        </h1>
                        <p className="text-gray-600">
                            You'll use this provider to log in to your network
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-12">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Sign in with</span>
                            </div>
                        </div>

                        {/* Microsoft Login Button */}
                        <Button
                            onClick={() => handleAzureLogin("azure")}
                            disabled={isLoggingIn || loading}
                            className="w-full bg-blue-100 text-black hover:bg-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaMicrosoft className="mr-2 h-4 w-4" />
                            {isLoggingIn ? "Redirecting..." : "Login"}
                        </Button>

                    </div>
                </div>

                {/* Right Section*/}
                <div className="hidden md:flex w-1/2 bg-gray-800 shadow-lg relative items-center justify-center p-8 transition-opacity duration-300 ease-in-out rounded-xl m-4">
                    <div className="absolute inset-0 bg-blue/30 z-0"></div>
                    <img
                        src={abstractimage}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative z-10 text-center mb-12"
                    >
                        <h1 className="text-3xl lg:text-4xl font-medium text-gray-800 mb-4">
                            Welcome to <b>Bravus Commercial Agentic AI</b>
                        </h1>
                        {/* <h2 className="text-2xl lg:text-3xl font-medium text-gray-700 mb-6">Can I help you with anything?</h2> */}
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                            Your one-stop solution for all commercial and SAP data needs. Streamline operations, gain insights, and
                            drive business excellence all in one place.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;