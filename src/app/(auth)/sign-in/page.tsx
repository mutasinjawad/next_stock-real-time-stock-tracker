'use client'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import CountrySelectField from "@/components/forms/CountrySelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import FooterLink from '../../../components/forms/FooterLink';
import SignUp from "../sign-up/page";

const SignIn = () => {
    const {
        register, 
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onBlur"
    })
    const onSubmit = async (data: SignInFormData) => {
        try{
            console.log(data);
        } catch(error) {
            console.log(error);
        }
    }
    return (
        <>
            <h1 className="form-title">Welcome Back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* INPUTS */}
                <InputField name="email" label="Email" placeholder="Enter your email" register={register} error={errors.email} validation={{ required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }}} />

                <InputField name="password" label="Password" type="password" placeholder="Enter your password" register={register} error={errors.password} validation={{ required: "Password is required", minLength: 8}} />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? "Logging In" : "Log In"}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Sign Up" href="/sign-up" />
            </form>
        </>
    )
}

export default SignIn;