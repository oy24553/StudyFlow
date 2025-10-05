import { useForm } from 'react-hook-form';
import client from '../api/client';


export default function StudyForm() {
    const { register, handleSubmit, reset } = useForm({ defaultValues: { method: 'deep' } });
    const onSubmit = async (v) => {
        await client.post('/study-sessions', v);
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input type="datetime-local" {...register('startAt', { required: true })} />
            <input type="datetime-local" {...register('endAt')} />
            <input placeholder="courseId" {...register('courseId')} />
            <select {...register('method')}>
                <option value="deep">deep</option>
                <option value="pomodoro">pomodoro</option>
                <option value="review">review</option>
            </select>
            <input placeholder="notes" {...register('notes')} />
            <button>Save</button>
        </form>
    );
}