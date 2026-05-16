import {
  useUser,
  useAuth,
  SignedIn,
  SignedOut,
} from "@authkit/react";

export default function App() {

  const {
    user,
    loading,
  } = useUser();

  const {
    signInWithGithub,
    signInWithGoogle,
    signOut,
  } = useAuth();

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (

    <div
      style={{
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >

      <h1>
        AuthKIT SDK Test
      </h1>

      <SignedOut>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
          }}
        >

          <button
            onClick={
              signInWithGithub
            }
          >
            Login with GitHub
          </button>

          <button
            onClick={
              signInWithGoogle
            }
          >
            Login with Google
          </button>

        </div>

      </SignedOut>

      <SignedIn>

        <div
          style={{
            marginTop: 20,
          }}
        >

          <img
            src={user?.avatar}
            width={80}
            style={{
              borderRadius: 999,
            }}
          />

          <h2>
            {user?.name}
          </h2>

          <p>
            {user?.email}
          </p>

          <button
            onClick={signOut}
          >
            Logout
          </button>

        </div>

      </SignedIn>

    </div>
  );
}