import { useForm } from 'react-hook-form';
import client from '../api/client';
import { Link } from 'react-router-dom';


export default function Login() {
    const { register, handleSubmit } = useForm();
    const onSubmit = async (v) => {
        const { data } = await client.post('/auth/login', v);
        localStorage.setItem('token', data.data.token);
        window.location.href = '/';
    };
    return (
        <div className="container" style={{ maxWidth: 420 }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="vstack">
                <label className="vstack"><span className="label">Email</span>
                    <input className="input" placeholder="you@example.com" {...register('email', { required: true })} />
                </label>
                <label className="vstack"><span className="label">Password</span>
                    <input className="input" type="password" placeholder="••••••" {...register('password', { required: true })} />
                </label>
                <button className="btn">Login</button>
                <div>Don’t have an account? <Link to="/register">Sign up</Link></div>
            </form>
        </div>
    );
}
