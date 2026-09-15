import { Typography } from "antd";
import { useAuth } from "../../auth/AuthProvider";

export default function HomePage() {
    const { user } = useAuth();
    return (
        <div>
            <Typography.Title level={2}>
                Welcome{user?.email ? `, ${user.email}` : ""}
            </Typography.Title>
            <Typography.Paragraph>
                You are logged in{user?.role ? ` as ${user.role}` : ""}.
            </Typography.Paragraph>
        </div>
    );
}
