import AuthForm from "@/components/auth/AuthForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/avatar";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-20">
      <AuthForm nextPath={nextPath} />
    </main>
  );
}
