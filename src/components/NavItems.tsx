"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

const NavItems = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    }

    return (
        <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            {NAV_ITEMS.map(({ href, title }) => (
                <li key={href}>
                    <Link href={href} className={`hover:text-yellow-500 transition-colors ${isActive(href) ? 'text-gray-100' : ''}`}>
                        {title}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default NavItems