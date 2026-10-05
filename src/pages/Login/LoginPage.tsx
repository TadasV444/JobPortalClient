import { useState } from "react";
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

type LoginForm = { email: string; password: string; remember: boolean };

export default function LoginPage() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: LoginForm) => {
        setError(null);
        try {
            await login({ email: values.email, password: values.password }, values.remember);
            navigate("/", { replace: true });
        } catch {
            setError("Invalid email or password.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f2f5",
            }}
        >
            <Card style={{ width: 360 }}>
                <Typography.Title level={3} style={{ textAlign: "center" }}>
                    Job Portal
                </Typography.Title>
                {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
                <Form layout="vertical" initialValues={{ remember: true }} onFinish={onFinish}>
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
                        <Input type="email" autoComplete="email" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Password is required" }]}
                    >
                        <Input.Password autoComplete="current-password" />
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Log in
                    </Button>
                </Form>
                <Typography.Paragraph style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
                    No account? <Link to="/register">Create one</Link>
                </Typography.Paragraph>
            </Card>
        </div>
    );
}
