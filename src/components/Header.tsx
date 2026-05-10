import Link from "next/link";
import NavItems from "./NavItems";
import UserDropDown from "./UserDropDown";

const Header = ({ user }: { user: User }) => {
    return (
        <header className="sticky top-0 header bg-zinc-900">
            <div className="container flex justify-between items-center py-3 px-6 mx-auto">
                <Link href="/">
                    <span className="text-xl font-bold text-gray-200">Stock Market</span>
                </Link>
                <nav className="hidden sm:block">
                    <NavItems />
                </nav>
                <UserDropDown user={user} />
            </div>
        </header>
    )
}

export default Header