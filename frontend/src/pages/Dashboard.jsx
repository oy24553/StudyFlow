import StudyTimer from '../components/StudyTimer';
import Chart7d from '../components/Chart7d';


export default function Dashboard() {
    return (
        <div className="vstack">
            <StudyTimer />
            <div className="card vstack">
                <div className="label">近 7 天学习时长</div>
                <Chart7d />
            </div>
        </div>
    );
}