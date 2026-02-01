
import Card from '@/components/common/Card';

const Profile = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <h1 className="text-2xl font-bold mb-4">Doctor Profile Management</h1>
                    <p>Edit your profile, specialization, and availability here.</p>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
