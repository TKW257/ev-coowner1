import { Form, Input, Select, Button, message } from "antd";
import voteApi from "../../../../api/voteApi";
import { useNavigate } from "react-router-dom";

export default function AdminCreateTopicPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      await voteApi.createTopic(values);
      message.success("Created successfully!");
      navigate("/admin/votes");
    } catch {
      message.error("Failed to create topic");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Vote Topic</h2>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item name="ownershipId" label="Ownership ID" required>
          <Input placeholder="Enter ownership ID" />
        </Form.Item>
        <Form.Item name="title" label="Title" required>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" required>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="decisionType" label="Decision Type" required>
          <Select
            options={[
              { value: "MINOR", label: "Minor" },
              { value: "MEDIUM", label: "Medium" },
              { value: "MAJOR", label: "Major" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form>
    </div>
  );
}
