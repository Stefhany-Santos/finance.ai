import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Home = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  // Redireciona a raiz para a pasta padronizada do dashboard
  redirect("/dashboard");
};

export default Home;
