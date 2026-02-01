
import Card from '@/components/common/Card';

const Appointments = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card>
                    <h1 className="text-2xl font-bold mb-4">My Appointment History</h1>
                    <p>List of past and upcoming appointments will appear here.</p>
                </Card>
            </div>
        </div>
    );
};

export default Appointments;
