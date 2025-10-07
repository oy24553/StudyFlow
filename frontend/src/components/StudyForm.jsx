import { useForm } from 'react-hook-form';
import client from '../api/client';
import CoursePicker from './CoursePicker';

export default function StudyForm() {
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            startAt: toInputLocal(new Date()),
            endAt: '',
            method: 'deep',
            notes: '',
            courseId: ''
        }
    });

    const onSubmit = async (v) => {
        const payload = {
            startAt: v.startAt ? new Date(v.startAt).toISOString() : new Date().toISOString(),
            endAt: v.endAt ? new Date(v.endAt).toISOString() : null,
            method: v.method,
            notes: v.notes || '',
            courseId: v.courseId || null
        };
        await client.post('/study-sessions', payload);
        window.dispatchEvent(new Event('study-updated'));
        reset({ startAt: toInputLocal(new Date()), endAt: '', method: 'deep', notes: '', courseId: v.courseId });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="vstack">
            <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
                <label className="vstack"><span className="label">开始</span>
                    <input className="input" type="datetime-local" {...register('startAt')} />
                </label>
                <label className="vstack"><span className="label">结束</span>
                    <input className="input" type="datetime-local" {...register('endAt')} />
                </label>
                <label className="vstack"><span className="label">方式</span>
                    <select className="input" {...register('method')}>
                        <option value="deep">deep</option>
                        <option value="pomodoro">pomodoro</option>
                        <option value="review">review</option>
                    </select>
                </label>
            </div>

            <label className="vstack"><span className="label">课程</span>
                <CoursePicker value={watch('courseId')} onChange={(id) => setValue('courseId', id || '')} allowNone />
            </label>

            <label className="vstack"><span className="label">备注</span>
                <input className="input" placeholder="学习要点 / 反思" {...register('notes')} />
            </label>

            <button className="btn">保存</button>
        </form>
    );
}

function toInputLocal(d) {
    const pad = n => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}
