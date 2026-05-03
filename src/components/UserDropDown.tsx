"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut } from "lucide-react";
import NavItems from "./NavItems";

const UserDropDown = () => {
    const router = useRouter();

    const handleSignOut = () => {
        router.push("/sign-in");
    }

    const user = { name : "Jawad", email : "jawad@gmail.com", avatarImage : "https://github.com/shadcn.png"}

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" className="flex items-center gap-3 text-gray-4 hover:text-yellow-500">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarImage} />
                        <AvatarFallback className="bg-yellow-400 text-yellow-900 text-sm font-bold">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-base font-medium text-gray-400">
                            {user.name}
                        </span>
                    </div>
                </Button>}
            />
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatarImage} />
                                <AvatarFallback className="bg-yellow-400 text-yellow-900 text-sm font-bold">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-base text-gray-400 font-medium">{user.name}</span>
                                <span className="text-sm text-gray-400">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <nav>
                        <NavItems />
                    </nav>
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="hidden sm:block" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserDropDown;