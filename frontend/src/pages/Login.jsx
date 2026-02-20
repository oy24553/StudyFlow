import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { login as loginApi } from '../api/auth';


export default function Login() {
    const [searchParams] = useSearchParams();
    const [err, setErr] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onSubmit' });

    const onSubmit = async (v) => {
        try {
            setErr('');
            await loginApi(v);
            const next = searchParams.get('next') || '/';
            window.location.href = next;
        } catch (e) {
            console.error(e);
            setErr(getErrMsg(e) || 'Login failed');
        }
    };

    const onDemo = async () => {
        const email = import.meta.env?.VITE_DEMO_EMAIL || 'demo@demo.com';
        const password = import.meta.env?.VITE_DEMO_PASSWORD || '123456';
        try {
            setErr('');
            await loginApi({ email, password });
            const next = searchParams.get('next') || '/';
            window.location.href = next;
        } catch (e) {
            console.error(e);
            setErr(getErrMsg(e) || 'Demo login failed');
        }
    };
    return (
        <div className="container" style={{ maxWidth: 420 }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="vstack">
                <label className="vstack"><span className="label">Email</span>
                    <input
                        className="input"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...register('email', {
                            required: 'Email is required',
                            validate: (v) => (String(v || '').includes('@') ? true : 'Please enter a valid email'),
                        })}
                    />
                    {errors.email && <div className="label" style={{ color: 'var(--danger)' }}>{errors.email.message}</div>}
                </label>
                <label className="vstack"><span className="label">Password</span>
                    <input
                        className="input"
                        type="password"
                        placeholder="••••••"
                        autoComplete="current-password"
                        {...register('password', { required: 'Password is required' })}
                    />
                    {errors.password && <div className="label" style={{ color: 'var(--danger)' }}>{errors.password.message}</div>}
                </label>
                {err && <div className="label" style={{ color: 'var(--danger)' }}>{err}</div>}
                <div className="hstack" style={{ gap: 8 }}>
                  <button className="btn ripple" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Login'}</button>
                  <button type="button" className="btn btn-demo ripple" onClick={onDemo} title="Login as Demo User" disabled={isSubmitting}>Demo Login</button>
                </div>
                <div>Don’t have an account? <Link to="/register">Sign up</Link></div>
            </form>
        </div>
    );
}

function getErrMsg(e) {
    return (
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        ''
    );
}
