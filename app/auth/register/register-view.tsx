"use client";

import React from "react";
import {
  Button,
  Input,
  Link,
  Divider,
  User,
  Checkbox,
  Form,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Blocks } from "lucide-react";

import { paths } from "@/constants/paths";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";

export default function RegisterView() {
  const { register } = useAuthStore();
  const [isVisible, setIsVisible] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    terms?: string;
  }>({});

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData) as {
      email?: string;
      password?: string;
      username?: string;
      confirmPassword?: string;
      terms?: string;
    };

    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
      username?: string;
    } = {};

    if (!data.email) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!data.password) {
      newErrors.password = "Please enter your password.";
    } else if (data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!data.terms) {
      newErrors.terms = "You must agree to the terms and conditions.";
    }

    if (!data.username) {
      newErrors.username = "Please enter your username.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      register(data.email!, data.password!, data.username!);
      redirect(paths.auth.login);
    }
  };

  return (
    <div className="relative flex min-h-screen max-h-screen h-full w-full">
      {/* Brand Logo */}
      <div className="absolute left-2 top-5 lg:left-5">
        <div className="flex items-center gap-2">
          <Blocks className="size-6 text-blue-400" />
          <p className="font-medium">Code Craft</p>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 p-4">
          <div className="w-full text-left">
            <p className="pb-2 text-xl font-medium">Create Account</p>
            <p className="text-small text-default-500">
              Sign up for a new account to get started
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
            >
              Sign Up with Google
            </Button>
            <Button
              startContent={
                <Icon
                  className="text-default-500"
                  icon="fe:github"
                  width={24}
                />
              }
              variant="bordered"
            >
              Sign Up with Github
            </Button>
          </div>

          <div className="flex w-full items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">OR</p>
            <Divider className="flex-1" />
          </div>

          <Form
            className="flex w-full flex-col gap-3"
            onSubmit={handleSubmit}
            validationErrors={errors}
            onReset={() => setErrors({})}
          >
            <Input
              isRequired
              label="Username"
              name="username"
              placeholder="Enter username"
              variant="underlined"
              errorMessage={errors.username}
            />
            <Input
              isRequired
              label="Email Address"
              name="email"
              placeholder="Enter your email"
              type="email"
              variant="underlined"
              errorMessage={errors.email}
            />
            <Input
              isRequired
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-bold"
                    />
                  )}
                </button>
              }
              label="Password"
              name="password"
              placeholder="Create a password"
              type={isVisible ? "text" : "password"}
              variant="underlined"
              errorMessage={errors.password}
            />
            <Input
              isRequired
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm your password"
              type={isVisible ? "text" : "password"}
              variant="underlined"
              errorMessage={errors.confirmPassword}
            />
            <Checkbox
              isRequired
              className="py-4"
              size="sm"
              name="terms"
              value="true"
              onChange={(e) =>
                setErrors((prev) => ({ ...prev, terms: undefined }))
              }
              isInvalid={!!errors.terms}
              validationBehavior="aria"
            >
              I agree with the&nbsp;
              <Link href="#" size="sm">
                Terms
              </Link>
              &nbsp; and&nbsp;
              <Link href="#" size="sm">
                Privacy Policy
              </Link>
            </Checkbox>
            {errors.terms && (
              <span className="text-danger text-small">{errors.terms}</span>
            )}
            <Button color="primary" type="submit">
              Sign Up
            </Button>
          </Form>

          <p className="text-center text-small">
            Already have an account?&nbsp;
            <Link href={paths.auth.login} size="sm">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div
        className="relative hidden w-1/2 flex-col-reverse rounded-medium p-10 shadow-small lg:flex"
        style={{
          backgroundImage:
            "url(https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/white-building.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-end gap-4">
          <User
            avatarProps={{
              src: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
            }}
            classNames={{
              base: "flex flex-row-reverse",
              name: "w-full text-right text-black",
              description: "text-black/80",
            }}
            description="Founder & CEO at Code Craft"
            name="Yusuf Star"
          />
          <p className="w-full text-right text-2xl text-black/60">
            <span className="font-medium">“</span>
            <span className="font-normal italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget
              augue nec massa volutpat aliquet.
            </span>
            <span className="font-medium">”</span>
          </p>
        </div>
      </div>
    </div>
  );
}
