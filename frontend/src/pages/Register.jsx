import { useForm } from 'react-hook-form';
import client from '../api/client';
import { Link } from 'react-router-dom';


export default function Register() {
    const { register, handleSubmit } = useForm();
    const onSubmit = async (v) => {
        await client.post('/auth/register', v);
        // On success, log in directly
        const { data } = await client.post('/auth/login', { email: v.email, password: v.password });
        localStorage.setItem('token', data.data.token);
        window.location.href = '/';
    };
    return (
        <div className="container" style={{ maxWidth: 420 }}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="vstack">
                <label className="vstack"><span className="label">Email</span>
                    <input className="input" placeholder="you@example.com" {...register('email', { required: true })} />
                </label>
                <label className="vstack"><span className="label">Name (optional)</span>
                    <input className="input" placeholder="Your name" {...register('name')} />
                </label>
                <label className="vstack"><span className="label">Password</span>
                    <input className="input" type="password" placeholder="At least 6 characters" {...register('password', { required: true, minLength: 6 })} />
                </label>
                <button className="btn">Register and continue</button>
                <div>Already have an account? <Link to="/login">Log in</Link></div>
            </form>
        </div>
    );
}
