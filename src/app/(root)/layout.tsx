import { ReactNode } from "react";
import Header from "@/components/Header";

const Layout = ({children}: {children: ReactNode}) => {
    return (
        <main className="min-h-screen text-gray-400">
            <Header />
            <div className="container flex justify-between items-center py-3 px-6 mx-auto w-full">
                {children}
            </div>
        </main>
    )
}

export default Layout