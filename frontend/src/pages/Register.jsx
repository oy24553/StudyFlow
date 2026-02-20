import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { register as registerApi } from '../api/auth';


export default function Register() {
    const [err, setErr] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onSubmit' });

    const onSubmit = async (v) => {
        try {
            setErr('');
            await registerApi(v);
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            setErr(getErrMsg(e) || 'Register failed');
        }
    };
    return (
        <div className="container" style={{ maxWidth: 420 }}>
            <h1>Register</h1>
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
                <label className="vstack"><span className="label">Name (optional)</span>
                    <input className="input" placeholder="Your name" autoComplete="name" {...register('name')} />
                </label>
                <label className="vstack"><span className="label">Password</span>
                    <input
                        className="input"
                        type="password"
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                    />
                    {errors.password && <div className="label" style={{ color: 'var(--danger)' }}>{errors.password.message}</div>}
                </label>
                {err && <div className="label" style={{ color: 'var(--danger)' }}>{err}</div>}
                <button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Register and continue'}</button>
                <div>Already have an account? <Link to="/login">Log in</Link></div>
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
