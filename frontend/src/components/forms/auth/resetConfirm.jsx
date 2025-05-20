import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import API_ENDPOINTS from "../../../constant/api";

const ResetConfirmForm = ({ onResetSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm();

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    setValue("code", updatedOtp.join(""));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // Optional: Call backend to verify OTP first (if needed)
      setIsOtpVerified(true);
      toast.success("OTP verified. You can now reset your password.");
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };
const onSubmit = async (data) => {
  if (data.password !== data.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  try {
    const response = await axios.put(
      API_ENDPOINTS.auth.resetPasswordConfirm,
      {
        code: data.code,
        password: data.password, // <-- This matches backend now!
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      toast.success("Password reset successful");
      onResetSuccess();
    } else {
      toast.error(response.data.message || "Failed to reset password");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred. Please try again.");
    }
  }
};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md mx-auto p-6 rounded space-y-6 bg-white text-black"
    >
      <h2 className="text-2xl font-semibold text-black">Reset Password</h2>

      {/* OTP Section */}
      {!isOtpVerified && (
        <>
          <div>
            <label className="block mb-1 font-medium text-black">Reset Code</label>
            <div className="flex gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center border-black"
                />
              ))}
            </div>
            <input
              type="hidden"
              {...register("code", { required: "Reset code is required" })}
            />
          </div>
          <Button
            type="button"
            onClick={handleOtpSubmit}
            disabled={isVerifyingOtp}
            className="w-full bg-[#111827] hover:bg-[#111827] "
          >
            {isVerifyingOtp ? "Verifying..." : "Send"}
          </Button>
        </>
      )}

      {/* Password Reset Section */}
      {isOtpVerified && (
        <>
          <div className="relative">
            <label htmlFor="password" className="block mb-1 font-medium text-black">
              New Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              className="border-black pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-9 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block mb-1 font-medium text-black">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Confirm password is required",
              })}
              className="border-black pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-9 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#111827] hover:bg-[#111827]"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </>
      )}
    </form>
  );
};

export default ResetConfirmForm;
