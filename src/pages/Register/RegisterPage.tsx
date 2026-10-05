import { useState } from "react";
import { Alert, Button, Card, Form, Input, InputNumber, Tabs, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { postData } from "../../services/api";

type Role = "candidate" | "employer";

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role>("candidate");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Register returns no refresh token so log in right after to get a full session
    const onFinish = async (values: Record<string, unknown>) => {
        setError(null);
        setSubmitting(true);
        try {
            await postData(`/auth/register-${role}`, values);
            await login({ email: values.email as string, password: values.password as string });
            navigate("/", { replace: true });
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSubmitting(false);
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
            <Card style={{ width: 400 }}>
                <Typography.Title level={3} style={{ textAlign: "center" }}>
                    Create account
                </Typography.Title>
                <Tabs
                    centered
                    activeKey={role}
                    onChange={(k) => setRole(k as Role)}
                    items={[
                        { key: "candidate", label: "Candidate" },
                        { key: "employer", label: "Employer" },
                    ]}
                />
                {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                        <Input autoComplete="email" />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    {role === "employer" && (
                        <Form.Item label="Company name" name="companyName" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    )}
                    <Form.Item label="Location" name="location" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    {role === "candidate" && (
                        <>
                            <Form.Item
                                label="Years of experience"
                                name="yearsOfExperience"
                                initialValue={0}
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={60} style={{ width: "100%" }} />
                            </Form.Item>
                            <Form.Item label="Summary" name="summary" rules={[{ required: true }]}>
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </>
                    )}
                    <Button type="primary" htmlType="submit" block loading={submitting}>
                        Register
                    </Button>
                </Form>
                <Typography.Paragraph style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
                    Already have an account? <Link to="/login">Log in</Link>
                </Typography.Paragraph>
            </Card>
        </div>
    );
}
