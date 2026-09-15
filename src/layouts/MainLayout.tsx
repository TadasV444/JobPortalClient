import { useState } from "react";
import { HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu, Space, Typography, theme } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
            >
                <div
                    style={{
                        height: 32,
                        margin: 16,
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: 6,
                        textAlign: "center",
                        color: "white",
                        lineHeight: "32px",
                        fontWeight: 600,
                    }}
                >
                    {collapsed ? "JP" : "Job Portal"}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={[{ key: "/", icon: <HomeOutlined />, label: <Link to="/">Home</Link> }]}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: "0 16px",
                        background: colorBgContainer,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <Dropdown
                        menu={{
                            items: [
                                { key: "logout", label: "Logout", icon: <LogoutOutlined />, onClick: logout },
                            ],
                        }}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <Avatar>{(user?.email ?? "U").charAt(0).toUpperCase()}</Avatar>
                                <Text>{user?.email ?? "User"}</Text>
                            </Space>
                        </a>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>

                <Footer style={{ textAlign: "center" }}>Job Portal ©{new Date().getFullYear()}</Footer>
            </Layout>
        </Layout>
    );
}
