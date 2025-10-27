import { Form, Input, Select, Button, message } from "antd";
import voteApi from "../../../api/voteApi";
import { useNavigate } from "react-router-dom";

export default function AdminCreateTopicPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log("Submitting topic data:", values); // debug
    try {
      await voteApi.createTopic(values);
      message.success("Created successfully!");
      navigate("/admin/vote");
    } catch (err) {
      console.error("Create topic error:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create topic";
      message.error(serverMsg);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Vote Topic</h2>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="ownershipId"
          label="Ownership ID"
          rules={[{ required: true, message: "Please enter ownership ID" }]}
        >
          <Input placeholder="Enter ownership ID" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input placeholder="Topic title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} placeholder="Topic description" />
        </Form.Item>

        <Form.Item
          name="decisionType"
          label="Decision Type"
          rules={[{ required: true, message: "Please select decision type" }]}
        >
          <Select
            options={[
              { value: "MINOR", label: "Minor" },
              { value: "MEDIUM", label: "Medium" },
              { value: "MAJOR", label: "Major" },
            ]}
            placeholder="Select decision type"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
