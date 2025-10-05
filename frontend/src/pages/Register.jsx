import { useForm } from 'react-hook-form';
import client from '../api/client';
import { Link } from 'react-router-dom';


export default function Register() {
    const { register, handleSubmit } = useForm();
    const onSubmit = async (v) => {
        await client.post('/auth/register', v);
        // 成功后直接登录
        const { data } = await client.post('/auth/login', { email: v.email, password: v.password });
        localStorage.setItem('token', data.data.token);
        window.location.href = '/';
    };
    return (
        <div className="container" style={{ maxWidth: 420 }}>
            <h1>注册</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="vstack">
                <label className="vstack"><span className="label">Email</span>
                    <input className="input" placeholder="you@example.com" {...register('email', { required: true })} />
                </label>
                <label className="vstack"><span className="label">姓名（可选）</span>
                    <input className="input" placeholder="Your name" {...register('name')} />
                </label>
                <label className="vstack"><span className="label">密码</span>
                    <input className="input" type="password" placeholder="至少6位" {...register('password', { required: true, minLength: 6 })} />
                </label>
                <button className="btn">注册并进入</button>
                <div>已有账号？<Link to="/login">去登录</Link></div>
            </form>
        </div>
    );
}