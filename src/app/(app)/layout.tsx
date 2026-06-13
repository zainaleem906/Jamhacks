import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { userToAuth } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const authUser = userToAuth(user);

  return (
    <div className="flex min-h-screen">
      <Navbar user={authUser} />
      <main className="flex-1 md:ml-0 pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
