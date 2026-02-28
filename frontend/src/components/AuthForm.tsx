import type { Dispatch, SetStateAction } from "react";

interface Props {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  isRegisterMode: boolean;
  setIsRegisterMode: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  onSubmit: () => void;
  loading: boolean;
}

export default function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  isRegisterMode,
  setIsRegisterMode,
  error,
  onSubmit,
  loading,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl mb-6 text-center">
          {isRegisterMode ? "Register" : "Login"}
        </h2>

        {error && (
          <div className="bg-red-500/20 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <input
          className="w-full p-3 mb-3 bg-white/20 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-6 bg-white/20 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-indigo-500 py-3 rounded mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isRegisterMode ? "Register" : "Login"}
        </button>

        <p className="text-center text-sm">
          {isRegisterMode
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="ml-2 underline"
          >
            {isRegisterMode ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
