
import { useParams } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const DoctorProfile = () => {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                            👨‍⚕️
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Doctor Profile (ID: {id})</h1>
                            <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
                                Cardiologist • 10+ Years Experience
                            </p>
                            <div className="mt-4">
                                <Button>Book Appointment</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p>Detailed bio and qualifications will go here.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DoctorProfile;
