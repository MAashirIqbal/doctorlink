
import { useParams } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const Booking = () => {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>
                    <p>Booking for doctor ID: {id}</p>
                    <div className="mt-4">
                        <Button disabled>Booking Flow Placeholder</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Booking;
