import {
  LoginCard,
  ProfileCard,
  SignedIn,
  SignedOut,
  useUser,
} from "@authcit/react";

export default function App() {
  const { loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SignedIn>
        <ProfileCard />
      </SignedIn>

      <SignedOut>
        <LoginCard />
      </SignedOut>
    </div>
  );
}
