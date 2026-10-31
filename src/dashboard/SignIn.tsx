import { useState, type FormEvent } from 'react';
import { useSignIn } from '../data/session';

/** DERIVED (not in the design): a minimal sign-in card using the Dark Ops tokens. */
export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useSignIn();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div className="b-root b-signin-root" data-variant="dark-ops">
      <main className="b-signin">
        <form className="b-card b-card-g14 b-signin-card" onSubmit={submit}>
          <h1 className="b-h2">Sign in to Harbor Goods</h1>
          <label className="b-field">
            <span className="b-kpi-label">Email</span>
            <input className="b-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="b-field">
            <span className="b-kpi-label">Password</span>
            <input className="b-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {signIn.isError && (
            <p role="alert" className="b-signin-error">
              {signIn.error.message}
            </p>
          )}
          <button type="submit" className="b-btn b-btn-primary" disabled={signIn.isPending}>
            {signIn.isPending ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </main>
    </div>
  );
}
