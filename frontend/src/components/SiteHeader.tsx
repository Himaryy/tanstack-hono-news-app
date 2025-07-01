import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userQueryOption } from "@/lib/api";

const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useQuery(userQueryOption());
  // 5:38

  return (
    <header
      className="sticky top-0 z-50 w-full border-border/40 bg-primary/95 backdrop-blur 
    supports-[backdrop-filter]:bg-primary/90"
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold">
            HimaryNews
          </Link>
          <nav className="hidden items-center space-x-4 md:flex">
            <Link to="/" className="hover:underline">
              New
            </Link>
            <Link to="/" className="hover:underline">
              Top
            </Link>
            <Link to="/" className="hover:underline">
              Submit
            </Link>
          </nav>
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          {user ? (
            <>
              <span className="">{user.data.username}</span>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
              >
                <a href="/api/auth/logout">Logout</a>
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
            >
              <Link to="/">Login</Link>
            </Button>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" className="md:hidden">
              <MenuIcon className="size-6" />
            </Button>
          </SheetTrigger>

          <SheetContent className="mb-2">
            <SheetHeader>
              <SheetTitle>HimaryNews</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col space-y-4">
              <Link
                onClick={() => setIsOpen(false)}
                to="/"
                className="hover:underline"
              >
                New
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                to="/"
                className="hover:underline"
              >
                Top
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                to="/"
                className="hover:underline"
              >
                Submit
              </Link>

              {user ? (
                <>
                  <span className="">{user.data.username}</span>
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
                  >
                    <a href="/api/auth/logout">Logout</a>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
                >
                  <Link onClick={() => setIsOpen(false)} to="/login">
                    Login
                  </Link>
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default SiteHeader;
